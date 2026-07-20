import { Injectable, Logger, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { DomainEvent } from '@eventos-ai/messaging'
import { Projection, ProjectionStatus, IProjectionEngine } from './interfaces/projection.interface'

interface ProjectionEngineOptions {
    pollingIntervalMs?: number
}

@Injectable()
export class ProjectionEngineService implements IProjectionEngine, OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(ProjectionEngineService.name)
    private readonly prisma: PrismaClient
    private readonly projections: Map<string, Projection> = new Map()
    private pollingTimer: ReturnType<typeof setInterval> | null = null
    private running = false
    private readonly pollingIntervalMs: number

    constructor(
        @Inject('PROJECTION_ENGINE_OPTIONS') options?: ProjectionEngineOptions,
    ) {
        this.prisma = new PrismaClient()
        this.pollingIntervalMs = options?.pollingIntervalMs ?? 1000
    }

    async onModuleInit(): Promise<void> {
        await this.prisma.$connect()
        this.logger.log('ProjectionEngine connected to database')
    }

    async onModuleDestroy(): Promise<void> {
        await this.stop()
        await this.prisma.$disconnect()
    }

    register(projection: Projection): void {
        if (this.projections.has(projection.name)) {
            this.logger.warn(`Projection "${projection.name}" is already registered — overwriting`)
        }
        this.projections.set(projection.name, projection)
        this.logger.log(`Registered projection: ${projection.name} (v${projection.version})`)
    }

    async start(): Promise<void> {
        if (this.running) return
        this.running = true

        this.logger.log(`Starting projection engine (polling every ${this.pollingIntervalMs}ms)`)

        const poll = async () => {
            if (!this.running) return
            try {
                await this.poll()
            } catch (error) {
                this.logger.error('Unhandled error during poll cycle', error)
            }
        }

        await poll()
        this.pollingTimer = setInterval(poll, this.pollingIntervalMs)
    }

    async stop(): Promise<void> {
        this.running = false
        if (this.pollingTimer) {
            clearInterval(this.pollingTimer)
            this.pollingTimer = null
        }
        this.logger.log('Projection engine stopped')
    }

    async rebuild(projectionName: string): Promise<void> {
        const projection = this.projections.get(projectionName)
        if (!projection) {
            throw new Error(`Projection "${projectionName}" is not registered`)
        }

        this.logger.log(`Rebuilding projection: ${projectionName}`)

        await this.prisma.projectionStatus.upsert({
            where: { name: projectionName },
            create: {
                name: projectionName,
                lastEventId: null,
                lastSequence: null,
                lastProcessedAt: null,
                state: null,
                version: projection.version,
            },
            update: {
                lastEventId: null,
                lastSequence: null,
                lastProcessedAt: null,
                state: null,
                version: projection.version,
            },
        })

        await projection.rebuild()
        this.logger.log(`Rebuild complete for projection: ${projectionName}`)
    }

    async getStatus(projectionName?: string): Promise<ProjectionStatus | ProjectionStatus[]> {
        if (projectionName) {
            const row = await this.prisma.projectionStatus.findUnique({
                where: { name: projectionName },
            })
            if (!row) {
                throw new Error(`No status found for projection "${projectionName}"`)
            }
            return this.toProjectionStatus(row)
        }

        const rows = await this.prisma.projectionStatus.findMany()
        return rows.map(r => this.toProjectionStatus(r))
    }

    private async poll(): Promise<void> {
        for (const [name, projection] of this.projections) {
            try {
                await this.processProjection(name, projection)
            } catch (error) {
                this.logger.error(`Error processing projection "${name}"`, error)
            }
        }
    }

    private async processProjection(name: string, projection: Projection): Promise<void> {
        const status = await this.prisma.projectionStatus.findUnique({ where: { name } })

        const lastSequence = status?.lastSequence ? Number(status.lastSequence) : 0
        const lastEventId = status?.lastEventId ?? null

        const events = await this.prisma.eventStream.findMany({
            where: {
                id: lastEventId ? { gt: lastEventId } : undefined,
                recordedAt: lastEventId ? undefined : undefined,
            },
            orderBy: [{ recordedAt: 'asc' }, { id: 'asc' }],
            take: 100,
        })

        if (events.length === 0) return

        for (const event of events) {
            try {
                const domainEvent: DomainEvent = {
                    eventId: event.id,
                    eventType: event.eventType,
                    source: event.aggregateType,
                    timestamp: event.recordedAt,
                    correlationId: event.correlationId ?? '',
                    payload: event.data as Record<string, any>,
                }

                await projection.handler(domainEvent)

                await this.prisma.projectionStatus.upsert({
                    where: { name },
                    create: {
                        name,
                        lastEventId: event.id,
                        lastSequence: BigInt(lastSequence + 1),
                        lastProcessedAt: new Date(),
                        state: null,
                        version: projection.version,
                    },
                    update: {
                        lastEventId: event.id,
                        lastSequence: BigInt(lastSequence + 1),
                        lastProcessedAt: new Date(),
                        version: projection.version,
                    },
                })
            } catch (error) {
                this.logger.error(
                    `Error processing event ${event.id} (${event.eventType}) for projection "${name}"`,
                    error,
                )
            }
        }
    }

    private toProjectionStatus(row: any): ProjectionStatus {
        return {
            name: row.name,
            lastProcessedEventId: row.lastEventId,
            lastProcessedAt: row.lastProcessedAt,
            state: (row.state as Record<string, unknown>) ?? {},
        }
    }
}
