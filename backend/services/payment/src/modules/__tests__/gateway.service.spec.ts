import { Test, TestingModule } from '@nestjs/testing';
import { GatewayService } from '../gateway/gateway.service';
import { PrismaService } from '../../infra/database/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('GatewayService', () => {
    let service: GatewayService;
    let prisma: any;

    const mockDate = new Date('2026-01-01T00:00:00.000Z');

    const mockConfig = {
        id: 'config-1',
        organizationId: 'org-1',
        gateway: 'stripe',
        credentials: { apiKey: 'sk_test_xxx' },
        webhookSecret: 'whsec_xxx',
        active: true,
        createdAt: mockDate,
        updatedAt: mockDate,
    };

    beforeEach(async () => {
        prisma = {
            gatewayConfig: {
                findUnique: jest.fn().mockResolvedValue(null),
                create: jest.fn().mockResolvedValue(mockConfig),
                findMany: jest.fn().mockResolvedValue([mockConfig]),
                update: jest.fn().mockResolvedValue({ ...mockConfig, active: false }),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GatewayService,
                { provide: PrismaService, useValue: prisma },
            ],
        }).compile();

        service = module.get<GatewayService>(GatewayService);
    });

    it('should route to correct gateway strategy', () => {
        const stripe = service.getStrategy('stripe');
        expect(stripe).toBeDefined();

        const asaas = service.getStrategy('asaas');
        expect(asaas).toBeDefined();

        const mp = service.getStrategy('mercado_pago');
        expect(mp).toBeDefined();
    });

    it('should throw on unknown gateway strategy', () => {
        expect(() => service.getStrategy('unknown')).toThrow(NotFoundException);
    });

    it('Stripe strategy should process payment', async () => {
        const strategy = service.getStrategy('stripe');
        const result = await strategy.process({ amount: 100, currency: 'BRL' });
        expect(result.gatewayId).toContain('stripe_');
        expect(result.status).toBe('processing');
    });

    it('Stripe strategy should refund payment', async () => {
        const strategy = service.getStrategy('stripe');
        const result = await strategy.refund({ gatewayId: 'stripe_123' });
        expect(result.status).toBe('refunded');
    });

    it('Asaas strategy should process payment', async () => {
        const strategy = service.getStrategy('asaas');
        const result = await strategy.process({ amount: 200, currency: 'BRL' });
        expect(result.gatewayId).toContain('asaas_');
        expect(result.status).toBe('processing');
    });

    it('MercadoPago strategy should process payment', async () => {
        const strategy = service.getStrategy('mercado_pago');
        const result = await strategy.process({ amount: 300, currency: 'BRL' });
        expect(result.gatewayId).toContain('mp_');
        expect(result.status).toBe('processing');
    });

    it('should create gateway config', async () => {
        const result = await service.create({
            organizationId: 'org-1',
            gateway: 'stripe',
            credentials: { apiKey: 'sk_test_xxx' },
        });

        expect(prisma.gatewayConfig.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    organizationId: 'org-1',
                    gateway: 'stripe',
                }),
            }),
        );
        expect(result).toEqual(mockConfig);
    });

    it('should throw on duplicate gateway config', async () => {
        prisma.gatewayConfig.findUnique.mockResolvedValue(mockConfig);

        await expect(
            service.create({
                organizationId: 'org-1',
                gateway: 'stripe',
                credentials: {},
            }),
        ).rejects.toThrow(ConflictException);
    });

    it('should list gateway configs', async () => {
        const result = await service.findAll('org-1');
        expect(prisma.gatewayConfig.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { organizationId: 'org-1' } }),
        );
        expect(result).toHaveLength(1);
    });

    it('should update gateway config', async () => {
        prisma.gatewayConfig.findUnique.mockResolvedValue(mockConfig);

        const result = await service.update('config-1', { active: false });
        expect(prisma.gatewayConfig.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'config-1' },
                data: { active: false },
            }),
        );
        expect(result.active).toBe(false);
    });

    it('should throw on update non-existent config', async () => {
        prisma.gatewayConfig.findUnique.mockResolvedValue(null);

        await expect(
            service.update('invalid-id', { active: false }),
        ).rejects.toThrow(NotFoundException);
    });
});
