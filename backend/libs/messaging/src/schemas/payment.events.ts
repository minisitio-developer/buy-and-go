export interface PaymentCompletedEvent {
    paymentId: string;
    organizationId: string;
    eventId: string;
    userId: string;
    orderId?: string;
    amount: number;
    fee: number;
    total: number;
    method: string;
    currency: string;
    installments: number;
    completedAt: Date;
    gatewayResponse?: Record<string, any>;
}

export interface PaymentFailedEvent {
    paymentId: string;
    organizationId: string;
    eventId: string;
    userId: string;
    orderId?: string;
    amount: number;
    method: string;
    reason: string;
    failedAt: Date;
    gatewayResponse?: Record<string, any>;
}

export interface PaymentRefundedEvent {
    refundId: string;
    paymentId: string;
    organizationId: string;
    eventId: string;
    amount: number;
    reason?: string;
    status: string;
    refundedAt: Date;
}
