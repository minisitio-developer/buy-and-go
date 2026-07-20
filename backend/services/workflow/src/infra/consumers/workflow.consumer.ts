import { Injectable, Logger } from '@nestjs/common';
import { EventBusService, TOPICS, DomainEvent } from '@eventos-ai/messaging';
import { PrismaService } from '../database/prisma.service';
import { TriggersService } from '../../modules/triggers/triggers.service';

@Injectable()
export class WorkflowConsumer {
    private readonly logger = new Logger(WorkflowConsumer.name);

    constructor(
        private readonly eventBus: EventBusService,
        private readonly prisma: PrismaService,
        private readonly triggers: TriggersService,
    ) {}

    async onModuleInit(): Promise<void> {
        const eventTopics = Object.values(TOPICS)
            .flatMap(group => Object.values(group as Record<string, string>))
            .filter(t => typeof t === 'string');

        for (const topic of eventTopics) {
            await this.eventBus.subscribe(
                topic as string,
                `workflow-${topic?.toLowerCase().replace(/\./g, '-')}`,
                this.handleDomainEvent.bind(this),
            );
        }

        this.logger.log('Workflow consumers initialized');
    }

    private async handleDomainEvent(event: DomainEvent): Promise<void> {
        this.logger.log(`Received domain event: ${event.type}`);

        try {
            const workflows = await this.prisma.workflow.findMany({
                where: {
                    enabled: true,
                    trigger: 'event',
                    triggerConfig: { path: '$.eventType', equals: event.type },
                },
                include: { steps: { orderBy: { order: 'asc' } } },
            });

            for (const workflow of workflows) {
                await this.triggers.executeFromEvent(workflow, event);
            }
        } catch (error) {
            this.logger.error(`Error handling domain event ${event.type}`, error);
        }
    }
}
