import { Injectable, Logger } from '@nestjs/common';
import { EventBusService, TOPICS, DomainEvent } from '@eventos-ai/messaging';
import { AuditService } from '../../modules/audit/audit.service';

@Injectable()
export class AuditConsumer {
    private readonly logger = new Logger(AuditConsumer.name);

    constructor(
        private readonly eventBus: EventBusService,
        private readonly audit: AuditService,
    ) {}

    async onModuleInit(): Promise<void> {
        const topics = [
            TOPICS.CHECKIN.CHECKIN_CREATED,
            TOPICS.CHECKIN.CHECKIN_VERIFIED,
            TOPICS.TICKET.ORDER_CREATED,
            TOPICS.TICKET.ORDER_CONFIRMED,
            TOPICS.TICKET.ORDER_REFUNDED,
            TOPICS.TICKET.TICKET_ISSUED,
            TOPICS.CRM.DEAL_CREATED,
            TOPICS.CRM.DEAL_MOVED,
            TOPICS.CRM.DEAL_CLOSED,
            TOPICS.CRM.CONTACT_CREATED,
            TOPICS.PAYMENT.PAYMENT_COMPLETED,
            TOPICS.PAYMENT.PAYMENT_FAILED,
            TOPICS.PAYMENT.PAYMENT_REFUNDED,
            TOPICS.EVENT.EVENT_CREATED,
            TOPICS.EVENT.EVENT_PUBLISHED,
            TOPICS.EVENT.EVENT_CANCELLED,
        ];

        for (const topic of topics) {
            await this.eventBus.subscribe(
                topic,
                `audit-${topic.replace(/\./g, '-')}`,
                (event) => this.handleDomainEvent(event),
            );
        }

        this.logger.log(`Audit consumer subscribed to ${topics.length} topics`);
    }

    private async handleDomainEvent(event: DomainEvent): Promise<void> {
        try {
            const parts = event.eventType.split('.');
            await this.audit.log({
                eventType: event.eventType,
                resource: parts.length >= 2 ? parts[parts.length - 2] : 'domain',
                resourceId: event.payload?.aggregateId as string,
                action: parts[parts.length - 1] || event.eventType,
                details: event.payload as Record<string, any>,
                organizationId: (event.payload as any)?.organizationId,
                userId: (event.payload as any)?.userId,
            });
        } catch (error) {
            this.logger.error(`Error logging audit event ${event.eventId}`, error);
        }
    }
}
