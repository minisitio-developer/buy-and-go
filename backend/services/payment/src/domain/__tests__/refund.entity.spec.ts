enum RefundStatus {
    pending = 'pending',
    approved = 'approved',
    rejected = 'rejected',
    completed = 'completed',
}

interface RefundProps {
    id?: string;
    paymentId: string;
    amount: number;
    reason?: string;
    status?: RefundStatus;
    initiatedBy?: string;
    approvedBy?: string;
}

class RefundEntity {
    id: string;
    paymentId: string;
    amount: number;
    reason?: string;
    status: RefundStatus;
    initiatedBy: string;
    approvedBy?: string;
    processedAt?: Date;
    createdAt: Date;

    constructor(props: RefundProps) {
        this.id = props.id || 'test-refund-id';
        this.paymentId = props.paymentId;
        this.amount = props.amount;
        this.reason = props.reason;
        this.status = props.status || RefundStatus.pending;
        this.initiatedBy = props.initiatedBy || 'system';
        this.approvedBy = props.approvedBy;
        this.createdAt = new Date();
    }

    approve(approvedBy: string): void {
        if (this.status === RefundStatus.completed) {
            throw new Error('Cannot approve already completed refund');
        }
        if (this.status === RefundStatus.rejected) {
            throw new Error('Cannot approve rejected refund');
        }
        this.status = RefundStatus.approved;
        this.approvedBy = approvedBy;
    }

    reject(reason?: string): void {
        if (this.status === RefundStatus.completed) {
            throw new Error('Cannot reject already completed refund');
        }
        this.status = RefundStatus.rejected;
        this.reason = reason;
    }

    complete(): void {
        if (this.status !== RefundStatus.approved) {
            throw new Error('Only approved refunds can be completed');
        }
        this.status = RefundStatus.completed;
        this.processedAt = new Date();
    }

    canProcess(): boolean {
        return this.status === RefundStatus.approved;
    }
}

describe('RefundEntity', () => {
    const defaultProps: RefundProps = {
        paymentId: 'payment-1',
        amount: 50.00,
        reason: 'customer_request',
    };

    it('should create refund with pending status', () => {
        const refund = new RefundEntity(defaultProps);
        expect(refund.status).toBe(RefundStatus.pending);
        expect(refund.amount).toBe(50.00);
        expect(refund.reason).toBe('customer_request');
    });

    it('should approve refund', () => {
        const refund = new RefundEntity(defaultProps);
        refund.approve('admin-1');
        expect(refund.status).toBe(RefundStatus.approved);
        expect(refund.approvedBy).toBe('admin-1');
    });

    it('should reject refund', () => {
        const refund = new RefundEntity(defaultProps);
        refund.reject('policy_violation');
        expect(refund.status).toBe(RefundStatus.rejected);
        expect(refund.reason).toBe('policy_violation');
    });

    it('should complete refund after approval', () => {
        const refund = new RefundEntity(defaultProps);
        refund.approve('admin-1');
        refund.complete();
        expect(refund.status).toBe(RefundStatus.completed);
        expect(refund.processedAt).toBeDefined();
    });

    it('should not complete unapproved refund', () => {
        const refund = new RefundEntity(defaultProps);
        expect(() => refund.complete()).toThrow('Only approved refunds can be completed');
    });

    it('should not approve already completed refund', () => {
        const refund = new RefundEntity(defaultProps);
        refund.approve('admin-1');
        refund.complete();
        expect(() => refund.approve('admin-2')).toThrow('Cannot approve already completed refund');
    });

    it('should check if refund can be processed', () => {
        const refund = new RefundEntity(defaultProps);
        expect(refund.canProcess()).toBe(false);
        refund.approve('admin-1');
        expect(refund.canProcess()).toBe(true);
    });

    it('should create with system initiated', () => {
        const refund = new RefundEntity({ ...defaultProps, initiatedBy: 'system' });
        expect(refund.initiatedBy).toBe('system');
    });
});
