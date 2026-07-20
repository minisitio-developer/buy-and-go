enum PaymentStatus {
    pending = 'pending',
    processing = 'processing',
    completed = 'completed',
    failed = 'failed',
    refunded = 'refunded',
}

interface PaymentProps {
    id?: string;
    organizationId: string;
    eventId: string;
    userId: string;
    amount: number;
    currency?: string;
    method?: string;
    installments?: number;
    status?: PaymentStatus;
    fee?: number;
    paidAt?: Date;
    refundedAt?: Date;
}

class PaymentEntity {
    id: string;
    organizationId: string;
    eventId: string;
    userId: string;
    amount: number;
    currency: string;
    method: string;
    installments: number;
    status: PaymentStatus;
    fee: number;
    total: number;
    paidAt?: Date;
    refundedAt?: Date;

    constructor(props: PaymentProps) {
        this.id = props.id || 'test-id';
        this.organizationId = props.organizationId;
        this.eventId = props.eventId;
        this.userId = props.userId;
        this.amount = props.amount;
        this.currency = props.currency || 'BRL';
        this.method = props.method || 'credit_card';
        this.installments = props.installments || 1;
        this.status = props.status || PaymentStatus.pending;
        this.fee = props.fee ?? this.calculateFee();
        this.total = this.amount + this.fee;
        this.paidAt = props.paidAt;
        this.refundedAt = props.refundedAt;
    }

    private calculateFee(): number {
        const feeRate = 0.0399;
        const fixedFee = 0.49;
        return Math.round((this.amount * feeRate + fixedFee) * 100) / 100;
    }

    process(): void {
        if (this.status === PaymentStatus.completed) {
            throw new Error('Cannot process already completed payment');
        }
        if (this.status === PaymentStatus.refunded) {
            throw new Error('Cannot process refunded payment');
        }
        this.status = PaymentStatus.processing;
    }

    complete(): void {
        this.status = PaymentStatus.completed;
        this.paidAt = new Date();
    }

    fail(reason: string): void {
        this.status = PaymentStatus.failed;
    }

    refund(): void {
        if (this.status === PaymentStatus.refunded) {
            throw new Error('Payment already refunded');
        }
        if (this.status !== PaymentStatus.completed) {
            throw new Error('Only completed payments can be refunded');
        }
        this.status = PaymentStatus.refunded;
        this.refundedAt = new Date();
    }
}

describe('PaymentEntity', () => {
    const defaultProps: PaymentProps = {
        organizationId: 'org-1',
        eventId: 'event-1',
        userId: 'user-1',
        amount: 100.00,
    };

    it('should create payment with pending status', () => {
        const payment = new PaymentEntity(defaultProps);
        expect(payment.status).toBe(PaymentStatus.pending);
        expect(payment.amount).toBe(100.00);
        expect(payment.currency).toBe('BRL');
    });

    it('should process payment (status -> processing -> completed)', () => {
        const payment = new PaymentEntity(defaultProps);
        expect(payment.status).toBe(PaymentStatus.pending);
        payment.process();
        expect(payment.status).toBe(PaymentStatus.processing);
        payment.complete();
        expect(payment.status).toBe(PaymentStatus.completed);
        expect(payment.paidAt).toBeDefined();
    });

    it('should fail payment with reason', () => {
        const payment = new PaymentEntity(defaultProps);
        payment.fail('insufficient_funds');
        expect(payment.status).toBe(PaymentStatus.failed);
    });

    it('should refund payment', () => {
        const payment = new PaymentEntity({ ...defaultProps, status: PaymentStatus.completed });
        payment.refund();
        expect(payment.status).toBe(PaymentStatus.refunded);
        expect(payment.refundedAt).toBeDefined();
    });

    it('should not refund already refunded payment', () => {
        const payment = new PaymentEntity({ ...defaultProps, status: PaymentStatus.refunded });
        expect(() => payment.refund()).toThrow('Payment already refunded');
    });

    it('should not process already completed payment', () => {
        const payment = new PaymentEntity({ ...defaultProps, status: PaymentStatus.completed });
        expect(() => payment.process()).toThrow('Cannot process already completed payment');
    });

    it('should calculate fee correctly', () => {
        const payment = new PaymentEntity(defaultProps);
        const expectedFee = Math.round((100.00 * 0.0399 + 0.49) * 100) / 100;
        expect(payment.fee).toBe(expectedFee);
        expect(payment.total).toBe(100.00 + expectedFee);
    });
});
