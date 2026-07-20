export const TOPICS = {
    CHECKIN: {
        CHECKIN_CREATED: 'eventos.checkin.created',
        CHECKIN_VERIFIED: 'eventos.checkin.verified',
        ATTENDEE_SYNCED: 'eventos.checkin.attendee.synced',
    },
    TICKET: {
        ORDER_CREATED: 'eventos.ticket.order.created',
        ORDER_CONFIRMED: 'eventos.ticket.order.confirmed',
        ORDER_REFUNDED: 'eventos.ticket.order.refunded',
        TICKET_ISSUED: 'eventos.ticket.issued',
    },
    CRM: {
        DEAL_CREATED: 'eventos.crm.deal.created',
        DEAL_MOVED: 'eventos.crm.deal.moved',
        DEAL_CLOSED: 'eventos.crm.deal.closed',
        CONTACT_CREATED: 'eventos.crm.contact.created',
    },
    PAYMENT: {
        PAYMENT_COMPLETED: 'eventos.payment.completed',
        PAYMENT_FAILED: 'eventos.payment.failed',
        PAYMENT_REFUNDED: 'eventos.payment.refunded',
    },
    SPONSOR: {
        SPONSOR_REGISTERED: 'eventos.sponsor.registered',
        BOOTH_CHECKIN: 'eventos.sponsor.booth.checkin',
    },
    EVENT: {
        EVENT_CREATED: 'eventos.event.created',
        EVENT_PUBLISHED: 'eventos.event.published',
        EVENT_CANCELLED: 'eventos.event.cancelled',
    },
    NOTIFICATION: {
        NOTIFICATION_SENT: 'eventos.notification.sent',
    },
};
