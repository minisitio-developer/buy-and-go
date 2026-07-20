import { Injectable, Logger } from '@nestjs/common';
import { EventBusService, TOPICS, DomainEvent } from '@eventos-ai/messaging';
import { NotificationsService } from '../../modules/notifications/notifications.service';
import { PreferencesService } from '../../modules/preferences/preferences.service';

@Injectable()
export class NotificationConsumer {
    private readonly logger = new Logger(NotificationConsumer.name);

    constructor(
        private readonly eventBus: EventBusService,
        private readonly notificationsService: NotificationsService,
        private readonly preferencesService: PreferencesService,
    ) {}

    async onModuleInit(): Promise<void> {
        await this.eventBus.subscribe(
            TOPICS.TICKET.ORDER_CONFIRMED,
            'notification-order-confirmed',
            this.handleOrderConfirmed.bind(this),
        );

        await this.eventBus.subscribe(
            TOPICS.CHECKIN.CHECKIN_CREATED,
            'notification-checkin-created',
            this.handleCheckinCreated.bind(this),
        );

        await this.eventBus.subscribe(
            TOPICS.PAYMENT.PAYMENT_COMPLETED,
            'notification-payment-completed',
            this.handlePaymentCompleted.bind(this),
        );

        await this.eventBus.subscribe(
            TOPICS.PAYMENT.PAYMENT_FAILED,
            'notification-payment-failed',
            this.handlePaymentFailed.bind(this),
        );

        await this.eventBus.subscribe(
            TOPICS.TICKET.TICKET_ISSUED,
            'notification-ticket-issued',
            this.handleTicketIssued.bind(this),
        );

        await this.eventBus.subscribe(
            TOPICS.CHECKIN.CHECKIN_VERIFIED,
            'notification-checkin-verified',
            this.handleCheckinVerified.bind(this),
        );

        await this.eventBus.subscribe(
            TOPICS.EVENT.EVENT_CREATED,
            'notification-event-created',
            this.handleEventCreated.bind(this),
        );

        await this.eventBus.subscribe(
            TOPICS.EVENT.EVENT_PUBLISHED,
            'notification-event-published',
            this.handleEventPublished.bind(this),
        );

        this.logger.log('Notification consumers initialized');
    }

    private async handleOrderConfirmed(event: DomainEvent): Promise<void> {
        const { eventId, userId, email, name, orderId, netTotal } = event.payload;
        this.logger.log(`Order confirmed: ${orderId} for ${email}`);

        try {
            const prefs = await this.preferencesService.findByParticipant(eventId, userId);
            if (this.isChannelEnabled(prefs, 'email')) {
                await this.notificationsService.send({
                    organizationId: event.payload.organizationId,
                    eventId,
                    participantId: userId,
                    type: 'email',
                    to: email,
                    subject: 'Pedido Confirmado - Eventos AI',
                    body: `Olá ${name}, seu pedido #${orderId} no valor de R$ ${netTotal} foi confirmado com sucesso!`,
                });
            }
            if (this.isChannelEnabled(prefs, 'whatsapp')) {
                await this.notificationsService.send({
                    organizationId: event.payload.organizationId,
                    eventId,
                    participantId: userId,
                    type: 'whatsapp',
                    to: event.payload.phone,
                    body: `Olá ${name}, seu pedido #${orderId} foi confirmado! Total: R$ ${netTotal}.`,
                });
            }
        } catch (error) {
            this.logger.error(`Error processing order confirmed ${orderId}`, error);
        }
    }

    private async handleCheckinCreated(event: DomainEvent): Promise<void> {
        const { attendeeId, eventId, attendeeName, attendeeEmail, method } = event.payload;
        this.logger.log(`Checkin created: ${attendeeId} via ${method}`);

        try {
            const prefs = await this.preferencesService.findByParticipant(eventId, attendeeId);
            if (this.isChannelEnabled(prefs, 'email') && attendeeEmail) {
                await this.notificationsService.send({
                    organizationId: event.payload.organizationId,
                    eventId,
                    participantId: attendeeId,
                    type: 'email',
                    to: attendeeEmail,
                    subject: 'Check-in realizado com sucesso',
                    body: `Olá ${attendeeName}, seu check-in no evento foi realizado via ${method}. Seja bem-vindo(a)!`,
                });
            }
            if (this.isChannelEnabled(prefs, 'push')) {
                await this.notificationsService.send({
                    organizationId: event.payload.organizationId,
                    eventId,
                    participantId: attendeeId,
                    type: 'push',
                    to: attendeeId,
                    subject: 'Check-in realizado',
                    body: `Você fez check-in via ${method}.`,
                });
            }
        } catch (error) {
            this.logger.error(`Error processing checkin created ${attendeeId}`, error);
        }
    }

    private async handlePaymentCompleted(event: DomainEvent): Promise<void> {
        const { userId, email, name, amount, orderId } = event.payload;
        this.logger.log(`Payment completed: ${orderId} for ${email}`);

        try {
            await this.notificationsService.send({
                organizationId: event.payload.organizationId,
                participantId: userId,
                type: 'email',
                to: email,
                subject: 'Pagamento Confirmado',
                body: `Olá ${name}, o pagamento de R$ ${amount} referente ao pedido #${orderId} foi confirmado.`,
            });
        } catch (error) {
            this.logger.error(`Error processing payment completed ${orderId}`, error);
        }
    }

    private async handlePaymentFailed(event: DomainEvent): Promise<void> {
        const { userId, email, name, amount, orderId, reason } = event.payload;
        this.logger.log(`Payment failed: ${orderId} for ${email}`);

        try {
            await this.notificationsService.send({
                organizationId: event.payload.organizationId,
                participantId: userId,
                type: 'email',
                to: email,
                subject: 'Falha no Pagamento',
                body: `Olá ${name}, o pagamento de R$ ${amount} referente ao pedido #${orderId} falhou. Motivo: ${reason || 'não informado'}.`,
            });
        } catch (error) {
            this.logger.error(`Error processing payment failed ${orderId}`, error);
        }
    }

    private async handleTicketIssued(event: DomainEvent): Promise<void> {
        const { ticketId, orderId, eventId, attendeeEmail, attendeeName } = event.payload;
        this.logger.log(`Ticket issued: ${ticketId} for order ${orderId}`);

        try {
            await this.notificationsService.send({
                organizationId: event.payload.organizationId,
                eventId,
                participantId: event.payload.userId,
                type: 'email',
                to: attendeeEmail,
                subject: 'Seu ingresso já está disponível',
                body: `Olá ${attendeeName}, seu ingresso #${ticketId} já foi emitido. Apresente o QR code na entrada do evento.`,
            });
        } catch (error) {
            this.logger.error(`Error processing ticket issued ${ticketId}`, error);
        }
    }

    private async handleCheckinVerified(event: DomainEvent): Promise<void> {
        const { attendeeId, eventId, attendeeName, attendeeEmail } = event.payload;
        this.logger.log(`Checkin verified: ${attendeeId}`);

        try {
            if (attendeeEmail) {
                await this.notificationsService.send({
                    organizationId: event.payload.organizationId,
                    eventId,
                    participantId: attendeeId,
                    type: 'email',
                    to: attendeeEmail,
                    subject: 'Presença verificada com sucesso',
                    body: `Olá ${attendeeName}, sua presença foi verificada com sucesso no evento.`,
                });
            }
        } catch (error) {
            this.logger.error(`Error processing checkin verified ${attendeeId}`, error);
        }
    }

    private async handleEventCreated(event: DomainEvent): Promise<void> {
        const { eventId, name, organizerId } = event.payload;
        this.logger.log(`Event created: ${name}`);

        try {
            await this.notificationsService.send({
                organizationId: event.payload.organizationId,
                eventId,
                participantId: organizerId,
                type: 'email',
                to: event.payload.organizerEmail,
                subject: 'Evento criado com sucesso',
                body: `Olá, o evento "${name}" foi criado com sucesso! Complete as informações para publicá-lo.`,
            });
        } catch (error) {
            this.logger.error(`Error processing event created ${eventId}`, error);
        }
    }

    private async handleEventPublished(event: DomainEvent): Promise<void> {
        const { eventId, name, organizationId } = event.payload;
        this.logger.log(`Event published: ${name}`);

        try {
            await this.notificationsService.send({
                organizationId,
                eventId,
                type: 'email',
                to: event.payload.organizerEmail,
                subject: 'Evento publicado!',
                body: `Parabéns! O evento "${name}" foi publicado e já está disponível para o público.`,
            });
        } catch (error) {
            this.logger.error(`Error processing event published ${eventId}`, error);
        }
    }

    private isChannelEnabled(prefs: any[], channel: string): boolean {
        if (!prefs || prefs.length === 0) return true;
        const pref = prefs.find((p: any) => p.channel === channel);
        return pref ? pref.enabled : true;
    }
}
