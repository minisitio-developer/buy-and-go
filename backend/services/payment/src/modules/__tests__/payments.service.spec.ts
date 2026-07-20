import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from '../payments/payments.service';
import { PrismaService } from '../../infra/database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PaymentsService', () => {
    let service: PaymentsService;
    let prisma: any;

    const mockDate = new Date('2026-01-01T00:00:00.000Z');

    const mockPayment = {
        id: 'payment-1',
        organizationId: 'org-1',
        orderId: null,
        eventId: 'event-1',
        userId: 'user-1',
        amount: 100.00,
        currency: 'BRL',
        fee: 4.48,
        total: 104.48,
        method: 'credit_card',
        status: 'completed',
        gateway: null,
        gatewayId: null,
        installments: 1,
        paidAt: mockDate,
        refundedAt: null,
        createdAt: mockDate,
        updatedAt: mockDate,
        transactions: [],
        refunds: [],
        pixPayment: null,
        boletoPayment: null,
    };

    const mockRefund = {
        id: 'refund-1',
        paymentId: 'payment-1',
        amount: 100.00,
        reason: 'customer_request',
        status: 'pending',
        initiatedBy: 'user',
        approvedBy: null,
        processedAt: null,
        createdAt: mockDate,
    };

    beforeEach(async () => {
        prisma = {
            payment: {
                create: jest.fn().mockResolvedValue(mockPayment),
                findMany: jest.fn().mockResolvedValue([mockPayment]),
                findUnique: jest.fn().mockResolvedValue(mockPayment),
                count: jest.fn().mockResolvedValue(1),
                update: jest.fn().mockResolvedValue({ ...mockPayment, status: 'processing' }),
            },
            refund: {
                create: jest.fn().mockResolvedValue(mockRefund),
            },
            transaction: {
                create: jest.fn().mockResolvedValue({}),
            },
            $connect: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentsService,
                { provide: PrismaService, useValue: prisma },
            ],
        }).compile();

        service = module.get<PaymentsService>(PaymentsService);
    });

    it('should create payment', async () => {
        const result = await service.create({
            organizationId: 'org-1',
            eventId: 'event-1',
            userId: 'user-1',
            amount: 100.00,
            method: 'credit_card',
        });

        expect(prisma.payment.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    organizationId: 'org-1',
                    amount: 100.00,
                    status: 'pending',
                }),
            }),
        );
        expect(result).toEqual(mockPayment);
    });

    it('should list payments with filters', async () => {
        const result = await service.findAll({ eventId: 'event-1', status: 'completed' });

        expect(prisma.payment.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { eventId: 'event-1', status: 'completed' },
            }),
        );
        expect(result.data).toHaveLength(1);
        expect(result.pagination.total).toBe(1);
    });

    it('should get payment by id', async () => {
        const result = await service.findById('payment-1');
        expect(prisma.payment.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: 'payment-1' } }),
        );
        expect(result).toEqual(mockPayment);
    });

    it('should throw on non-existent payment', async () => {
        prisma.payment.findUnique.mockResolvedValue(null);
        await expect(service.findById('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should refund payment', async () => {
        const result = await service.refund('payment-1', { reason: 'customer_request' });

        expect(prisma.refund.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    paymentId: 'payment-1',
                    status: 'pending',
                }),
            }),
        );
        expect(result).toEqual(mockRefund);
    });

    it('should throw on double refund', async () => {
        prisma.payment.findUnique.mockResolvedValue({ ...mockPayment, status: 'refunded' });

        await expect(
            service.refund('payment-1', { reason: 'customer_request' }),
        ).rejects.toThrow(BadRequestException);
    });

    it('should throw on refund non-completed payment', async () => {
        prisma.payment.findUnique.mockResolvedValue({ ...mockPayment, status: 'pending' });

        await expect(
            service.refund('payment-1', { reason: 'customer_request' }),
        ).rejects.toThrow(BadRequestException);
    });

    it('should capture payment', async () => {
        prisma.payment.findUnique.mockResolvedValue({ ...mockPayment, status: 'pending' });

        const result = await service.capture('payment-1');
        expect(prisma.payment.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'payment-1' },
                data: { status: 'processing' },
            }),
        );
        expect(result.status).toBe('processing');
    });

    it('should throw capture on non-pending payment', async () => {
        await expect(service.capture('payment-1')).rejects.toThrow(BadRequestException);
    });
});
