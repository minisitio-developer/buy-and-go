import { Injectable, Logger } from '@nestjs/common';
import { EventBusService, TOPICS, DomainEvent } from '@eventos-ai/messaging';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class CrmConsumers {
    private readonly logger = new Logger(CrmConsumers.name);

    constructor(
        private readonly eventBus: EventBusService,
        private readonly prisma: PrismaService,
    ) {}

    async onModuleInit(): Promise<void> {
        await this.eventBus.subscribe(
            TOPICS.CHECKIN.CHECKIN_CREATED,
            'crm-checkin-events',
            this.handleCheckinCreated.bind(this),
        );

        await this.eventBus.subscribe(
            TOPICS.PAYMENT.PAYMENT_COMPLETED,
            'crm-payment-events',
            this.handlePaymentCompleted.bind(this),
        );

        this.logger.log('CRM consumers initialized');
    }

    private async handleCheckinCreated(event: DomainEvent): Promise<void> {
        const { attendeeId, eventId, attendeeName, attendeeEmail } = event.payload;

        this.logger.log(`Checkin event for attendee ${attendeeId} at event ${eventId}`);

        try {
            const contact = attendeeEmail
                ? await this.prisma.contact.findFirst({ where: { email: attendeeEmail } })
                : null;

            if (contact) {
                await this.prisma.contactInteraction.create({
                    data: {
                        contactId: contact.id,
                        type: 'event_checkin',
                        description: `Checked in at event ${eventId}`,
                        metadata: { eventId, attendeeId, timestamp: event.timestamp },
                    },
                });
            }
        } catch (error) {
            this.logger.error('Error handling checkin created event', error);
        }
    }

    private async handlePaymentCompleted(event: DomainEvent): Promise<void> {
        const { paymentId, organizationId, eventId, userId, amount } = event.payload;

        this.logger.log(`Payment completed: ${paymentId} for event ${eventId}`);

        try {
            const contact = await this.prisma.contact.findFirst({
                where: { organizationId, userId },
            });

            if (contact) {
                await this.prisma.contactInteraction.create({
                    data: {
                        contactId: contact.id,
                        type: 'payment',
                        description: `Payment of ${amount} completed for event ${eventId}`,
                        metadata: { paymentId, eventId, amount },
                    },
                });
            }
        } catch (error) {
            this.logger.error('Error handling payment completed event', error);
        }
    }
}
