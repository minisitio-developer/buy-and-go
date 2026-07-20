import { Test, TestingModule } from '@nestjs/testing';
import { PixService } from '../pix/pix.service';
import { PrismaService } from '../../infra/database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PixService', () => {
    let service: PixService;
    let prisma: any;

    const mockDate = new Date('2026-01-01T00:00:00.000Z');
    const futureDate = new Date(Date.now() + 30 * 60 * 1000);

    const mockPayment = {
        id: 'payment-1',
        organizationId: 'org-1',
        eventId: 'event-1',
        userId: 'user-1',
        amount: 150.00,
        currency: 'BRL',
        method: 'pix',
        status: 'pending',
        fee: 0,
        total: 150.00,
        createdAt: mockDate,
        updatedAt: mockDate,
    };

    const mockPixPayment = {
        id: 'pix-1',
        paymentId: 'payment-1',
        txid: 'PIX1234567890ABCDEF',
        qrCode: 'pix-qr://PIX1234567890ABCDEF',
        qrCodeText: '0002010102122688...6304ABCD',
        expiration: futureDate,
        paidAt: null,
        createdAt: mockDate,
    };

    beforeEach(async () => {
        prisma = {
            payment: {
                findUnique: jest.fn().mockResolvedValue(mockPayment),
                update: jest.fn().mockResolvedValue({ ...mockPayment, status: 'completed', paidAt: mockDate }),
            },
            pixPayment: {
                findUnique: jest.fn().mockResolvedValue(null),
                create: jest.fn().mockResolvedValue(mockPixPayment),
                update: jest.fn().mockResolvedValue({ ...mockPixPayment, paidAt: mockDate }),
            },
            transaction: {
                create: jest.fn().mockResolvedValue({}),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PixService,
                { provide: PrismaService, useValue: prisma },
            ],
        }).compile();

        service = module.get<PixService>(PixService);
    });

    it('should generate PIX QR code', async () => {
        const result = await service.generate('payment-1');

        expect(prisma.pixPayment.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    paymentId: 'payment-1',
                    txid: expect.stringContaining('PIX'),
                }),
            }),
        );
        expect(result.txid).toContain('PIX');
        expect(result.qrCode).toContain('pix-qr://');
    });

    it('should return existing PIX if already generated', async () => {
        prisma.pixPayment.findUnique.mockResolvedValue(mockPixPayment);

        const result = await service.generate('payment-1');
        expect(result).toEqual(mockPixPayment);
        expect(prisma.pixPayment.create).not.toHaveBeenCalled();
    });

    it('should throw on non-PIX payment method', async () => {
        prisma.payment.findUnique.mockResolvedValue({ ...mockPayment, method: 'credit_card' });

        await expect(service.generate('payment-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw on non-existent payment', async () => {
        prisma.payment.findUnique.mockResolvedValue(null);

        await expect(service.generate('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should check PIX status', async () => {
        prisma.pixPayment.findUnique.mockResolvedValue(mockPixPayment);

        const result = await service.status('PIX1234567890ABCDEF');

        expect(result.txid).toBe('PIX1234567890ABCDEF');
        expect(result.status).toBe('pending');
    });

    it('should throw on non-existent PIX status', async () => {
        prisma.pixPayment.findUnique.mockResolvedValue(null);

        await expect(service.status('invalid-txid')).rejects.toThrow(NotFoundException);
    });

    it('should process PIX webhook - paid', async () => {
        prisma.pixPayment.findUnique.mockResolvedValue(mockPixPayment);

        const result = await service.handleWebhook({ txid: 'PIX1234567890ABCDEF', status: 'paid' });

        expect(prisma.pixPayment.update).toHaveBeenCalled();
        expect(prisma.payment.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'payment-1' },
                data: expect.objectContaining({ status: 'completed' }),
            }),
        );
        expect(prisma.transaction.create).toHaveBeenCalled();
        expect(result.received).toBe(true);
    });

    it('should reject invalid webhook payload', async () => {
        await expect(service.handleWebhook({})).rejects.toThrow(BadRequestException);
        await expect(service.handleWebhook({ txid: 'abc' })).rejects.toThrow(BadRequestException);
    });

    it('should throw on non-existent PIX in webhook', async () => {
        prisma.pixPayment.findUnique.mockResolvedValue(null);

        await expect(
            service.handleWebhook({ txid: 'invalid', status: 'paid' }),
        ).rejects.toThrow(NotFoundException);
    });
});
