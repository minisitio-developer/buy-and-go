import { Injectable, Logger } from '@nestjs/common';
import { EventBusService, TOPICS, DomainEvent } from '@eventos-ai/messaging';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CheckinConsumer {
    private readonly logger = new Logger(CheckinConsumer.name);

    constructor(
        private readonly eventBus: EventBusService,
        private readonly prisma: PrismaService,
    ) {}

    async onModuleInit(): Promise<void> {
        await this.eventBus.subscribe(
            TOPICS.TICKET.ORDER_CONFIRMED,
            'checkin-order-confirmed',
            this.handleOrderConfirmed.bind(this),
        );

        await this.eventBus.subscribe(
            TOPICS.TICKET.TICKET_ISSUED,
            'checkin-ticket-issued',
            this.handleTicketIssued.bind(this),
        );

        this.logger.log('Checkin consumers initialized');
    }

    private async handleOrderConfirmed(event: DomainEvent): Promise<void> {
        const { orderId, eventId, userId, netTotal } = event.payload;

        this.logger.log(`Order confirmed: ${orderId} for event ${eventId}`);

        try {
            const attendee = await this.prisma.attendee.findFirst({
                where: { eventId, userId },
            });

            if (attendee) {
                await this.prisma.attendee.update({
                    where: { id: attendee.id },
                    data: { metadata: { ...(attendee.metadata as Record<string, any> || {}), orderConfirmed: true, orderId } },
                });
            }
        } catch (error) {
            this.logger.error(`Error processing order confirmed ${orderId}`, error);
        }
    }

    private async handleTicketIssued(event: DomainEvent): Promise<void> {
        const { ticketId, orderId, eventId, attendeeDocument } = event.payload;

        this.logger.log(`Ticket issued: ${ticketId} for order ${orderId}`);

        try {
            if (attendeeDocument) {
                await this.prisma.credential.upsert({
                    where: { attendeeDocument_eventId: { attendeeDocument, eventId } },
                    update: { ticketId },
                    create: {
                        attendeeDocument,
                        eventId,
                        ticketId,
                        qrCode: `TICKET-${ticketId}`,
                    },
                });
            }
        } catch (error) {
            this.logger.error(`Error processing ticket issued ${ticketId}`, error);
        }
    }
}
