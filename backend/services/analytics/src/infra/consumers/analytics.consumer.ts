import { Injectable, Logger } from '@nestjs/common';
import { EventBusService, TOPICS, DomainEvent } from '@eventos-ai/messaging';
import { PrismaService } from '../database/prisma.service';
import { EventAnalyticsService } from '../../modules/event-analytics/event-analytics.service';

@Injectable()
export class AnalyticsConsumer {
    private readonly logger = new Logger(AnalyticsConsumer.name);

    constructor(
        private readonly eventBus: EventBusService,
        private readonly prisma: PrismaService,
        private readonly eventAnalytics: EventAnalyticsService,
    ) {}

    async onModuleInit(): Promise<void> {
        await this.eventBus.subscribe(
            TOPICS.CHECKIN.CHECKIN_CREATED,
            'analytics-checkin-created',
            this.handleCheckinCreated.bind(this),
        );

        await this.eventBus.subscribe(
            TOPICS.TICKET.ORDER_CONFIRMED,
            'analytics-order-confirmed',
            this.handleOrderConfirmed.bind(this),
        );

        await this.eventBus.subscribe(
            TOPICS.PAYMENT.PAYMENT_COMPLETED,
            'analytics-payment-completed',
            this.handlePaymentCompleted.bind(this),
        );

        await this.eventBus.subscribe(
            TOPICS.TICKET.TICKET_ISSUED,
            'analytics-ticket-issued',
            this.handleTicketIssued.bind(this),
        );

        this.logger.log('Analytics consumers initialized');
    }

    private async handleCheckinCreated(event: DomainEvent): Promise<void> {
        const { eventId, attendeeId, method, attendeeName, attendeeCategory, attendeeCompany } = event.payload;

        this.logger.log(`Processing checkin: ${attendeeId} for event ${eventId}`);

        try {
            await this.eventAnalytics.recordCheckin(eventId, {
                attendeeId,
                method,
                attendeeName,
                attendeeCategory,
                attendeeCompany,
            });
        } catch (error) {
            this.logger.error(`Error processing checkin ${attendeeId}`, error);
        }
    }

    private async handleOrderConfirmed(event: DomainEvent): Promise<void> {
        const { orderId, eventId, userId, netTotal, items } = event.payload;

        this.logger.log(`Processing order confirmed: ${orderId} for event ${eventId}`);

        try {
            await this.eventAnalytics.recordOrder(eventId, {
                orderId,
                userId,
                netTotal: netTotal || 0,
                ticketCount: items?.length || 1,
            });
        } catch (error) {
            this.logger.error(`Error processing order ${orderId}`, error);
        }
    }

    private async handlePaymentCompleted(event: DomainEvent): Promise<void> {
        const { paymentId, orderId, eventId, amount, paymentMethod } = event.payload;

        this.logger.log(`Processing payment: ${paymentId} for order ${orderId}`);

        try {
            await this.eventAnalytics.recordPayment(eventId, {
                paymentId,
                orderId,
                amount: amount || 0,
                paymentMethod,
            });
        } catch (error) {
            this.logger.error(`Error processing payment ${paymentId}`, error);
        }
    }

    private async handleTicketIssued(event: DomainEvent): Promise<void> {
        const { ticketId, orderId, eventId, attendeeDocument, attendeeName, ticketCategory } = event.payload;

        this.logger.log(`Processing ticket issued: ${ticketId} for event ${eventId}`);

        try {
            await this.eventAnalytics.recordTicketIssued(eventId, {
                ticketId,
                orderId,
                attendeeDocument,
                attendeeName,
                ticketCategory,
            });
        } catch (error) {
            this.logger.error(`Error processing ticket ${ticketId}`, error);
        }
    }
}
