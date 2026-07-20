enum TransactionType {
    authorization = 'authorization',
    capture = 'capture',
    refund = 'refund',
    chargeback = 'chargeback',
}

enum TransactionStatus {
    pending = 'pending',
    completed = 'completed',
    failed = 'failed',
}

interface TransactionProps {
    id?: string;
    paymentId: string;
    type: TransactionType;
    amount: number;
    status?: TransactionStatus;
    gatewayResponse?: any;
}

class TransactionEntity {
    id: string;
    paymentId: string;
    type: TransactionType;
    amount: number;
    status: TransactionStatus;
    gatewayResponse?: any;
    createdAt: Date;

    constructor(props: TransactionProps) {
        this.id = props.id || 'test-tx-id';
        this.paymentId = props.paymentId;
        this.type = props.type;
        this.amount = props.amount;
        this.status = props.status || TransactionStatus.pending;
        this.gatewayResponse = props.gatewayResponse;
        this.createdAt = new Date();
    }

    complete(): void {
        this.status = TransactionStatus.completed;
    }

    fail(error?: string): void {
        this.status = TransactionStatus.failed;
        this.gatewayResponse = { ...this.gatewayResponse, error };
    }

    isAuthorization(): boolean {
        return this.type === TransactionType.authorization;
    }

    isRefund(): boolean {
        return this.type === TransactionType.refund;
    }
}

describe('TransactionEntity', () => {
    const defaultProps: TransactionProps = {
        paymentId: 'payment-1',
        type: TransactionType.authorization,
        amount: 100.00,
    };

    it('should create transaction with pending status', () => {
        const tx = new TransactionEntity(defaultProps);
        expect(tx.status).toBe(TransactionStatus.pending);
        expect(tx.type).toBe(TransactionType.authorization);
        expect(tx.createdAt).toBeDefined();
    });

    it('should complete transaction', () => {
        const tx = new TransactionEntity(defaultProps);
        tx.complete();
        expect(tx.status).toBe(TransactionStatus.completed);
    });

    it('should fail transaction with error', () => {
        const tx = new TransactionEntity(defaultProps);
        tx.fail('gateway_timeout');
        expect(tx.status).toBe(TransactionStatus.failed);
        expect(tx.gatewayResponse?.error).toBe('gateway_timeout');
    });

    it('should identify authorization type', () => {
        const tx = new TransactionEntity(defaultProps);
        expect(tx.isAuthorization()).toBe(true);
        expect(tx.isRefund()).toBe(false);
    });

    it('should identify refund type', () => {
        const tx = new TransactionEntity({ ...defaultProps, type: TransactionType.refund });
        expect(tx.isRefund()).toBe(true);
        expect(tx.isAuthorization()).toBe(false);
    });

    it('should create capture transaction', () => {
        const tx = new TransactionEntity({
            paymentId: 'payment-1',
            type: TransactionType.capture,
            amount: 0,
        });
        expect(tx.type).toBe(TransactionType.capture);
        expect(tx.amount).toBe(0);
    });

    it('should create chargeback transaction', () => {
        const tx = new TransactionEntity({
            paymentId: 'payment-1',
            type: TransactionType.chargeback,
            amount: 100.00,
            gatewayResponse: { reason: 'fraud' },
        });
        expect(tx.type).toBe(TransactionType.chargeback);
        expect(tx.gatewayResponse.reason).toBe('fraud');
    });
});
