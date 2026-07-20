import { Injectable, Logger } from '@nestjs/common';
import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import { EventBusService, TOPICS } from '@eventos-ai/messaging';
import { PrismaService } from '../../infra/database/prisma.service';
import { ActionsService } from '../actions/actions.service';
import * as Handlebars from 'handlebars';

@Injectable()
export class TriggersService {
    private readonly logger = new Logger(TriggersService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly actions: ActionsService,
        private readonly eventBus: EventBusService,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) {}

    async onModuleInit() {
        await this.registerScheduledWorkflows();
    }

    private async registerScheduledWorkflows() {
        const workflows = await this.prisma.workflow.findMany({
            where: { enabled: true, trigger: 'schedule' },
            include: { steps: { orderBy: { order: 'asc' } } },
        });

        for (const workflow of workflows) {
            this.registerCronJob(workflow);
        }
    }

    registerCronJob(workflow: any) {
        const cronExpr = workflow.triggerConfig?.cron;
        if (!cronExpr) {
            this.logger.warn(`Workflow ${workflow.id} has no cron expression in triggerConfig`);
            return;
        }

        const jobName = `workflow-${workflow.id}`;

        if (this.schedulerRegistry.doesExist('cron', jobName)) {
            this.schedulerRegistry.deleteCronJob(jobName);
        }

        const job = new CronJob(cronExpr, async () => {
            this.logger.log(`Cron triggered workflow: ${workflow.name}`);
            await this.executeWorkflow(workflow, { source: 'schedule' });
        });

        this.schedulerRegistry.addCronJob(jobName, job);
        job.start();
        this.logger.log(`Registered cron job ${jobName} with expression ${cronExpr}`);
    }

    async executeFromEvent(workflow: any, event: any) {
        this.logger.log(`Event triggered workflow: ${workflow.name}`);

        const payload = {
            source: 'event',
            eventType: event.type,
            eventPayload: event.payload,
            metadata: event.metadata,
        };

        return this.executeWorkflow(workflow, payload);
    }

    async executeFromWebhook(webhookId: string, headers: any, body: any, query: any) {
        const workflow = await this.prisma.workflow.findFirst({
            where: {
                enabled: true,
                trigger: 'webhook',
                triggerConfig: { path: '$.webhookId', equals: webhookId },
            },
            include: { steps: { orderBy: { order: 'asc' } } },
        });

        if (!workflow) {
            this.logger.warn(`No workflow found for webhook: ${webhookId}`);
            return { status: 'not_found' };
        }

        const payload = {
            source: 'webhook',
            webhookId,
            headers,
            body,
            query,
        };

        return this.executeWorkflow(workflow, payload);
    }

    async executeWorkflow(workflow: any, context: Record<string, any>) {
        const execution = await this.prisma.workflowExecution.create({
            data: {
                workflowId: workflow.id,
                status: 'RUNNING',
                triggerEvent: context,
                startedAt: new Date(),
            },
        });

        this.eventBus.publish('workflow.execution.started', 'workflow.execution.started', {
            executionId: execution.id,
            workflowId: workflow.id,
            workflowName: workflow.name,
            context,
        }).catch(err => this.logger.error('Failed to publish execution started event', err));

        try {
            await this.runSteps(workflow, execution, context);

            await this.prisma.workflowExecution.update({
                where: { id: execution.id },
                data: { status: 'COMPLETED', completedAt: new Date() },
            });

            this.eventBus.publish('workflow.execution.completed', 'workflow.execution.completed', {
                executionId: execution.id,
                workflowId: workflow.id,
                workflowName: workflow.name,
                status: 'COMPLETED',
            }).catch(err => this.logger.error('Failed to publish execution completed event', err));
        } catch (error: any) {
            this.logger.error(`Workflow execution failed: ${workflow.name}`, error);

            await this.prisma.workflowExecution.update({
                where: { id: execution.id },
                data: { status: 'FAILED', error: error.message, completedAt: new Date() },
            });

            this.eventBus.publish('workflow.execution.failed', 'workflow.execution.failed', {
                executionId: execution.id,
                workflowId: workflow.id,
                workflowName: workflow.name,
                error: error.message,
            }).catch(err => this.logger.error('Failed to publish execution failed event', err));

            return { executionId: execution.id, status: 'FAILED', error: error.message };
        }

        return { executionId: execution.id, status: 'COMPLETED' };
    }

    private async runSteps(workflow: any, execution: any, context: Record<string, any>) {
        const variableStore: Record<string, any> = { ...context };

        for (const step of workflow.steps) {
            const stepExecution = await this.prisma.workflowExecutionStep.create({
                data: {
                    executionId: execution.id,
                    stepId: step.id,
                    status: 'RUNNING',
                    input: { config: step.config, context: variableStore },
                    startedAt: new Date(),
                },
            });

            try {
                const evaluatedConfig = this.evaluateExpressions(step.config, variableStore);

                const result = await this.actions.execute(step.type, evaluatedConfig, variableStore);

                if (result !== undefined && result !== null) {
                    if (typeof result === 'object') {
                        Object.assign(variableStore, result);
                    }
                    variableStore[`step_${step.order}_output`] = result;
                }

                if (step.type === 'condition') {
                    const conditionResult = result?.matched ?? false;
                    variableStore[`condition_${step.order}`] = conditionResult;

                    if (!conditionResult && step.config?.skipOnFalse) {
                        await this.prisma.workflowExecutionStep.update({
                            where: { id: stepExecution.id },
                            data: {
                                status: 'SKIPPED',
                                output: { skipped: true, reason: 'Condition not met' },
                                completedAt: new Date(),
                            },
                        });
                        continue;
                    }
                }

                await this.prisma.workflowExecutionStep.update({
                    where: { id: stepExecution.id },
                    data: {
                        status: 'COMPLETED',
                        output: result || {},
                        completedAt: new Date(),
                    },
                });
            } catch (error: any) {
                this.logger.error(`Step ${step.id} (${step.type}) failed: ${error.message}`);

                await this.prisma.workflowExecutionStep.update({
                    where: { id: stepExecution.id },
                    data: {
                        status: 'FAILED',
                        error: error.message,
                        completedAt: new Date(),
                    },
                });

                if (step.config?.stopOnError !== false) {
                    throw error;
                }
            }
        }
    }

    private evaluateExpressions(config: any, variables: Record<string, any>): any {
        if (typeof config === 'string') {
            if (config.includes('{{')) {
                const template = Handlebars.compile(config, { noEscape: true });
                return template(variables);
            }
            return config;
        }

        if (Array.isArray(config)) {
            return config.map(item => this.evaluateExpressions(item, variables));
        }

        if (config && typeof config === 'object') {
            const result: Record<string, any> = {};
            for (const [key, value] of Object.entries(config)) {
                result[key] = this.evaluateExpressions(value, variables);
            }
            return result;
        }

        return config;
    }
}
