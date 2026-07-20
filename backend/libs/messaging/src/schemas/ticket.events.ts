export interface OrderCreatedEvent {
    orderId: string;
    organizationId: string;
    eventId: string;
    userId: string;
    items: Array<{ ticketTypeId: string; quantity: number; unitPrice: number; total: number }>;
    total: number;
    discount: number;
    fee: number;
    netTotal: number;
    couponCode?: string;
    createdAt: Date;
}

export interface OrderConfirmedEvent {
    orderId: string;
    eventId: string;
    userId: string;
    paymentMethod: string;
    paymentId: string;
    paidAt: Date;
    netTotal: number;
}

export interface OrderRefundedEvent {
    orderId: string;
    eventId: string;
    refundedAt: Date;
    items: Array<{ ticketTypeId: string; quantity: number }>;
}

export interface TicketIssuedEvent {
    ticketId: string;
    orderId: string;
    eventId: string;
    ticketTypeId: string;
    attendeeName: string;
    attendeeDocument?: string;
    attendeeEmail?: string;
    issuedAt: Date;
}
