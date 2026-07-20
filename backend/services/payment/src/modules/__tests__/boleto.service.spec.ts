import { Test, TestingModule } from '@nestjs/testing';
import { BoletoService } from '../boleto/boleto.service';
import { PrismaService } from '../../infra/database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('BoletoService', () => {
    let service: BoletoService;
    let prisma: any;

    const mockDate = new Date('2026-01-01T00:00:00.000Z');
    const dueDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    const mockPayment = {
        id: 'payment-1',
        organizationId: 'org-1',
        eventId: 'event-1',
        userId: 'user-1',
        amount: 250.00,
        currency: 'BRL',
        method: 'boleto',
        status: 'pending',
        fee: 0,
        total: 250.00,
        createdAt: mockDate,
        updatedAt: mockDate,
    };

    const mockBoletoPayment = {
        id: 'boleto-1',
        paymentId: 'payment-1',
        barcode: '12345678901234567890123456789012345678901234',
        line: '12345.67890 12345.67890 12345.67890 1234 567890.123456',
        url: 'https://boleto.eventos.ai/12345678901234567890123456789012345678901234',
        dueDate,
        paidAt: null,
        createdAt: mockDate,
    };

    beforeEach(async () => {
        prisma = {
            payment: {
                findUnique: jest.fn().mockResolvedValue(mockPayment),
                update: jest.fn().mockResolvedValue({ ...mockPayment, status: 'completed', paidAt: mockDate }),
            },
            boletoPayment: {
                findUnique: jest.fn().mockResolvedValue(null),
                create: jest.fn().mockResolvedValue(mockBoletoPayment),
                update: jest.fn().mockResolvedValue({ ...mockBoletoPayment, paidAt: mockDate }),
            },
            transaction: {
                create: jest.fn().mockResolvedValue({}),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BoletoService,
                { provide: PrismaService, useValue: prisma },
            ],
        }).compile();

        service = module.get<BoletoService>(BoletoService);
    });

    it('should generate boleto', async () => {
        const result = await service.generate('payment-1');

        expect(prisma.boletoPayment.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    paymentId: 'payment-1',
                    barcode: expect.any(String),
                }),
            }),
        );
        expect(result.barcode).toBeDefined();
        expect(result.url).toContain('boleto.eventos.ai');
    });

    it('should return existing boleto if already generated', async () => {
        prisma.boletoPayment.findUnique.mockResolvedValue(mockBoletoPayment);

        const result = await service.generate('payment-1');
        expect(result).toEqual(mockBoletoPayment);
        expect(prisma.boletoPayment.create).not.toHaveBeenCalled();
    });

    it('should throw on non-boleto payment method', async () => {
        prisma.payment.findUnique.mockResolvedValue({ ...mockPayment, method: 'credit_card' });

        await expect(service.generate('payment-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw on non-existent payment', async () => {
        prisma.payment.findUnique.mockResolvedValue(null);

        await expect(service.generate('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should check boleto status', async () => {
        prisma.boletoPayment.findUnique.mockResolvedValue(mockBoletoPayment);

        const result = await service.status('boleto-1');

        expect(result.id).toBe('boleto-1');
        expect(result.status).toBe('pending');
        expect(result.barcode).toBeDefined();
    });

    it('should throw on non-existent boleto status', async () => {
        prisma.boletoPayment.findUnique.mockResolvedValue(null);

        await expect(service.status('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should process boleto webhook - paid', async () => {
        prisma.boletoPayment.findUnique.mockResolvedValue(mockBoletoPayment);

        const result = await service.handleWebhook({ barcode: mockBoletoPayment.barcode, status: 'paid' });

        expect(prisma.boletoPayment.update).toHaveBeenCalled();
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
        await expect(service.handleWebhook({ barcode: 'abc' })).rejects.toThrow(BadRequestException);
    });

    it('should throw on non-existent boleto in webhook', async () => {
        prisma.boletoPayment.findUnique.mockResolvedValue(null);

        await expect(
            service.handleWebhook({ barcode: 'invalid', status: 'paid' }),
        ).rejects.toThrow(NotFoundException);
    });
});
