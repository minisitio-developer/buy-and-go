import { Injectable, Logger, Inject } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import {
    SagaDefinition,
    SagaInstance,
    SagaStepInstance,
    SagaStep,
    SagaStatus,
    SagaStepStatus,
    SagaEvent,
} from './interfaces/saga.interface'

@Injectable()
export class SagaOrchestratorService {
    private readonly logger = new Logger(SagaOrchestratorService.name)
    private readonly prisma: PrismaClient
    private readonly definitions = new Map<string, SagaDefinition>()
    private readonly activeTimeouts = new Map<string, NodeJS.Timeout>()

    constructor(
        @Inject('SAGA_OPTIONS')
        private readonly options: {
            defaultStepTimeout?: number
            defaultRetries?: number
            defaultRetryDelay?: number
        } = {},
    ) {
        this.prisma = new PrismaClient()
    }

    async onModuleInit(): Promise<void> {
        await this.prisma.$connect()
        this.logger.log('SagaOrchestrator connected to database')
    }

    async onModuleDestroy(): Promise<void> {
        for (const [id, timeout] of this.activeTimeouts) {
            clearTimeout(timeout)
        }
        this.activeTimeouts.clear()
        await this.prisma.$disconnect()
    }

    defineSaga(name: string, steps: SagaStep[], timeout?: number): SagaDefinition {
        const definition: SagaDefinition = { name, steps, timeout }
        this.definitions.set(name, definition)
        this.logger.log(`Saga "${name}" defined with ${steps.length} step(s)`)
        return definition
    }

    async startSaga(sagaName: string, initialData?: any): Promise<SagaInstance> {
        const definition = this.definitions.get(sagaName)
        if (!definition) {
            throw new Error(`Saga "${sagaName}" is not defined`)
        }

        const id = uuidv4()
        const steps: SagaStepInstance[] = definition.steps.map((s) => ({
            name: s.name,
            status: SagaStepStatus.PENDING,
            retryCount: 0,
        }))

        const instance: SagaInstance = {
            id,
            sagaName,
            status: SagaStatus.ACTIVE,
            steps,
            currentStep: 0,
            metadata: initialData ?? {},
            createdAt: new Date(),
        }

        await this.prisma.sagaInstance.create({
            data: {
                id,
                sagaName,
                status: SagaStatus.ACTIVE,
                currentStep: 0,
                metadata: initialData ?? {},
                createdAt: instance.createdAt,
            },
        })

        await this.appendEvent(id, sagaName, {
            eventType: 'SAGA_STARTED',
            sagaId: id,
            status: SagaStatus.ACTIVE,
            data: initialData,
            timestamp: new Date(),
        })

        this.logger.log(`Saga "${sagaName}" started with id ${id}`)

        setImmediate(() => this.executeNextStep(id, definition, instance, initialData).catch((err) => {
            this.logger.error(`Unhandled error starting saga ${id}`, err)
        }))

        return instance
    }

    async executeStep(instanceId: string, stepName: string): Promise<any> {
        const dbInstance = await this.prisma.sagaInstance.findUnique({ where: { id: instanceId } })
        if (!dbInstance) {
            throw new Error(`Saga instance ${instanceId} not found`)
        }

        const definition = this.definitions.get(dbInstance.sagaName)
        if (!definition) {
            throw new Error(`Saga definition "${dbInstance.sagaName}" not found`)
        }

        const step = definition.steps.find((s) => s.name === stepName)
        if (!step) {
            throw new Error(`Step "${stepName}" not found in saga "${dbInstance.sagaName}"`)
        }

        const stepIndex = definition.steps.indexOf(step)
        const sagaSteps: SagaStepInstance[] = definition.steps.map((s, i) => {
            const events = []
            return {
                name: s.name,
                status: i < stepIndex ? SagaStepStatus.COMPLETED : i === stepIndex ? SagaStepStatus.EXECUTING : SagaStepStatus.PENDING,
                retryCount: 0,
            }
        })

        const data = dbInstance.metadata as any

        return this.executeStepWithRetry(instanceId, step, stepIndex, definition, sagaSteps, data)
    }

    async compensate(instanceId: string): Promise<void> {
        const dbInstance = await this.prisma.sagaInstance.findUnique({ where: { id: instanceId } })
        if (!dbInstance) {
            throw new Error(`Saga instance ${instanceId} not found`)
        }

        const definition = this.definitions.get(dbInstance.sagaName)
        if (!definition) {
            throw new Error(`Saga definition "${dbInstance.sagaName}" not found`)
        }

        await this.updateStatus(instanceId, SagaStatus.COMPENSATING)
        await this.appendEvent(instanceId, definition.name, {
            eventType: 'SAGA_COMPENSATING',
            sagaId: instanceId,
            status: SagaStatus.COMPENSATING,
            timestamp: new Date(),
        })

        const steps = definition.steps
        const completedSteps = steps.slice(0, dbInstance.currentStep).reverse()

        for (const step of completedSteps) {
            try {
                this.logger.log(`Compensating step "${step.name}" for saga ${instanceId}`)
                await step.compensate(dbInstance.metadata as any)

                await this.appendEvent(instanceId, definition.name, {
                    eventType: 'STEP_COMPENSATED',
                    sagaId: instanceId,
                    stepName: step.name,
                    status: SagaStepStatus.COMPENSATED,
                    timestamp: new Date(),
                })
            } catch (error: any) {
                this.logger.error(`Compensation failed for step "${step.name}" in saga ${instanceId}`, error)

                await this.appendEvent(instanceId, definition.name, {
                    eventType: 'COMPENSATION_FAILED',
                    sagaId: instanceId,
                    stepName: step.name,
                    status: SagaStepStatus.FAILED,
                    data: { error: error.message },
                    timestamp: new Date(),
                })
            }
        }

        await this.updateStatus(instanceId, SagaStatus.COMPENSATED)
        await this.updateCompletedAt(instanceId)

        await this.appendEvent(instanceId, definition.name, {
            eventType: 'SAGA_COMPENSATED',
            sagaId: instanceId,
            status: SagaStatus.COMPENSATED,
            timestamp: new Date(),
        })

        this.logger.log(`Saga ${instanceId} compensated`)
    }

    async getStatus(instanceId: string): Promise<SagaInstance | null> {
        const dbInstance = await this.prisma.sagaInstance.findUnique({ where: { id: instanceId } })
        if (!dbInstance) return null

        const events = await this.prisma.sagaEvent.findMany({
            where: { sagaInstanceId: instanceId },
            orderBy: { timestamp: 'asc' },
        })

        const definition = this.definitions.get(dbInstance.sagaName)
        const steps: SagaStepInstance[] = definition
            ? definition.steps.map((s, i) => {
                const stepEvents = events.filter((e) => e.stepName === s.name)
                const lastEvent = stepEvents[stepEvents.length - 1]
                return {
                    name: s.name,
                    status: (lastEvent?.stepStatus as SagaStepStatus) ?? SagaStepStatus.PENDING,
                    retryCount: 0,
                    ...(lastEvent?.data ? { output: lastEvent.data } : {}),
                }
            })
            : []

        return {
            id: dbInstance.id,
            sagaName: dbInstance.sagaName,
            status: dbInstance.status as SagaStatus,
            currentStep: dbInstance.currentStep,
            metadata: dbInstance.metadata,
            createdAt: dbInstance.createdAt,
            completedAt: dbInstance.completedAt ?? undefined,
            steps,
        }
    }

    async getDefinition(name: string): Promise<SagaDefinition | undefined> {
        return this.definitions.get(name)
    }

    private async executeNextStep(
        instanceId: string,
        definition: SagaDefinition,
        instance: SagaInstance,
        data: any,
    ): Promise<void> {
        const stepIndex = instance.currentStep

        if (stepIndex >= definition.steps.length) {
            await this.completeSaga(instanceId, definition.name)
            return
        }

        const step = definition.steps[stepIndex]

        try {
            await this.executeStepWithRetry(instanceId, step, stepIndex, definition, instance.steps, data)

            instance.currentStep++
            instance.steps[stepIndex].status = SagaStepStatus.COMPLETED

            await this.prisma.sagaInstance.update({
                where: { id: instanceId },
                data: { currentStep: instance.currentStep },
            })

            await this.appendEvent(instanceId, definition.name, {
                eventType: 'STEP_COMPLETED',
                sagaId: instanceId,
                stepName: step.name,
                status: SagaStepStatus.COMPLETED,
                timestamp: new Date(),
            })

            setImmediate(() => this.executeNextStep(instanceId, definition, instance, data).catch((err) => {
                this.logger.error(`Unhandled error in saga loop ${instanceId}`, err)
            }))
        } catch (error: any) {
            this.logger.error(`Step "${step.name}" failed for saga ${instanceId}: ${error.message}`)

            instance.steps[stepIndex].status = SagaStepStatus.FAILED
            instance.steps[stepIndex].error = error.message

            await this.appendEvent(instanceId, definition.name, {
                eventType: 'STEP_FAILED',
                sagaId: instanceId,
                stepName: step.name,
                status: SagaStepStatus.FAILED,
                data: { error: error.message },
                timestamp: new Date(),
            })

            await this.updateStatus(instanceId, SagaStatus.FAILED)

            if (step.compensate) {
                await this.compensate(instanceId)
            } else {
                await this.updateCompletedAt(instanceId)
                await this.appendEvent(instanceId, definition.name, {
                    eventType: 'SAGA_FAILED',
                    sagaId: instanceId,
                    status: SagaStatus.FAILED,
                    data: { error: error.message },
                    timestamp: new Date(),
                })
            }
        }
    }

    private async executeStepWithRetry(
        instanceId: string,
        step: SagaStep,
        stepIndex: number,
        definition: SagaDefinition,
        steps: SagaStepInstance[],
        data: any,
    ): Promise<any> {
        const maxRetries = step.retries ?? this.options.defaultRetries ?? 0
        const retryDelay = step.retryDelay ?? this.options.defaultRetryDelay ?? 1000
        let lastError: Error | undefined

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                if (attempt > 0) {
                    this.logger.log(`Retry attempt ${attempt}/${maxRetries} for step "${step.name}" in saga ${instanceId}`)
                    await this.delay(retryDelay * attempt)
                }

                const timeout = step.timeout ?? this.options.defaultStepTimeout ?? 30000
                const result = await this.withTimeout(step.action(data), timeout, `Step "${step.name}" timed out after ${timeout}ms`)

                steps[stepIndex].output = result
                return result
            } catch (error: any) {
                lastError = error
                steps[stepIndex].retryCount = attempt + 1

                this.logger.warn(`Attempt ${attempt + 1}/${maxRetries + 1} failed for step "${step.name}" in saga ${instanceId}: ${error.message}`)

                await this.appendEvent(instanceId, definition.name, {
                    eventType: 'STEP_RETRY',
                    sagaId: instanceId,
                    stepName: step.name,
                    status: SagaStepStatus.EXECUTING,
                    data: { attempt: attempt + 1, maxRetries, error: error.message },
                    timestamp: new Date(),
                })

                if (attempt < maxRetries) {
                    continue
                }
            }
        }

        throw lastError ?? new Error(`Step "${step.name}" failed after ${maxRetries + 1} attempt(s)`)
    }

    private async completeSaga(instanceId: string, sagaName: string): Promise<void> {
        await this.updateStatus(instanceId, SagaStatus.COMPLETED)
        await this.updateCompletedAt(instanceId)

        await this.appendEvent(instanceId, sagaName, {
            eventType: 'SAGA_COMPLETED',
            sagaId: instanceId,
            status: SagaStatus.COMPLETED,
            timestamp: new Date(),
        })

        this.logger.log(`Saga "${sagaName}" completed (${instanceId})`)
    }

    private async updateStatus(instanceId: string, status: SagaStatus): Promise<void> {
        await this.prisma.sagaInstance.update({
            where: { id: instanceId },
            data: { status },
        })
    }

    private async updateCompletedAt(instanceId: string): Promise<void> {
        await this.prisma.sagaInstance.update({
            where: { id: instanceId },
            data: { completedAt: new Date() },
        })
    }

    private async appendEvent(sagaInstanceId: string, sagaName: string, event: SagaEvent): Promise<void> {
        await this.prisma.sagaEvent.create({
            data: {
                id: uuidv4(),
                sagaInstanceId,
                sagaName,
                stepName: event.stepName ?? null,
                stepStatus: event.status ?? null,
                eventType: event.eventType,
                data: event.data ?? null,
                timestamp: event.timestamp,
            },
        })
    }

    private withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(message))
            }, ms)

            promise
                .then((value) => {
                    clearTimeout(timer)
                    resolve(value)
                })
                .catch((error) => {
                    clearTimeout(timer)
                    reject(error)
                })
        })
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }
}
