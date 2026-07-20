import { Test, TestingModule } from '@nestjs/testing';
import { SponsorsService } from '../sponsors/sponsors.service';
import { PrismaService } from '../../infra/database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('SponsorsService', () => {
    let service: SponsorsService;
    let prisma: any;

    const mockDate = new Date('2026-01-01T00:00:00.000Z');

    const mockSponsor = {
        id: 'sponsor-1',
        organizationId: 'org-1',
        eventId: 'event-1',
        name: 'Acme Corp',
        logoUrl: null,
        description: null,
        tier: 'silver',
        status: 'active',
        contractUrl: null,
        value: null,
        signedAt: null,
        createdAt: mockDate,
        updatedAt: mockDate,
        booths: [],
        payments: [],
        metrics: [],
        _count: { metrics: 0, payments: 0 },
    };

    beforeEach(async () => {
        prisma = {
            sponsor: {
                create: jest.fn().mockResolvedValue(mockSponsor),
                findMany: jest.fn().mockResolvedValue([mockSponsor]),
                findUnique: jest.fn().mockResolvedValue(mockSponsor),
                update: jest.fn().mockResolvedValue(mockSponsor),
                delete: jest.fn().mockResolvedValue(mockSponsor),
                count: jest.fn().mockResolvedValue(1),
            },
            sponsorPayment: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
            sponsorMetric: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
            sponsorBooth: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SponsorsService,
                { provide: PrismaService, useValue: prisma },
            ],
        }).compile();

        service = module.get<SponsorsService>(SponsorsService);
    });

    it('should create sponsor', async () => {
        const result = await service.create({
            organizationId: 'org-1',
            eventId: 'event-1',
            name: 'Acme Corp',
        });

        expect(prisma.sponsor.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    organizationId: 'org-1',
                    name: 'Acme Corp',
                    tier: 'silver',
                }),
            }),
        );
        expect(result).toEqual(mockSponsor);
    });

    it('should throw on invalid tier', async () => {
        await expect(
            service.create({
                organizationId: 'org-1',
                eventId: 'event-1',
                name: 'Acme Corp',
                tier: 'platinum',
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('should list sponsors with filters', async () => {
        const result = await service.findAll({ eventId: 'event-1', tier: 'silver' });

        expect(prisma.sponsor.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { eventId: 'event-1', tier: 'silver' },
            }),
        );
        expect(result.data).toHaveLength(1);
        expect(result.pagination.total).toBe(1);
    });

    it('should find one sponsor', async () => {
        const result = await service.findOne('sponsor-1');
        expect(prisma.sponsor.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: 'sponsor-1' } }),
        );
        expect(result).toEqual(mockSponsor);
    });

    it('should throw on non-existent sponsor', async () => {
        prisma.sponsor.findUnique.mockResolvedValue(null);
        await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
    });

    it('should update sponsor', async () => {
        const result = await service.update('sponsor-1', { name: 'Acme Updated' });
        expect(prisma.sponsor.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'sponsor-1' },
                data: { name: 'Acme Updated' },
            }),
        );
        expect(result).toEqual(mockSponsor);
    });

    it('should throw on update non-existent sponsor', async () => {
        prisma.sponsor.findUnique.mockResolvedValue(null);
        await expect(service.update('invalid', { name: 'test' })).rejects.toThrow(NotFoundException);
    });

    it('should throw on update with invalid tier', async () => {
        await expect(
            service.update('sponsor-1', { tier: 'platinum' }),
        ).rejects.toThrow(BadRequestException);
    });

    it('should remove sponsor with cascade', async () => {
        const result = await service.remove('sponsor-1');
        expect(prisma.sponsorPayment.deleteMany).toHaveBeenCalledWith({ where: { sponsorId: 'sponsor-1' } });
        expect(prisma.sponsorMetric.deleteMany).toHaveBeenCalledWith({ where: { sponsorId: 'sponsor-1' } });
        expect(prisma.sponsorBooth.deleteMany).toHaveBeenCalledWith({ where: { sponsorId: 'sponsor-1' } });
        expect(prisma.sponsor.delete).toHaveBeenCalledWith({ where: { id: 'sponsor-1' } });
        expect(result.deleted).toBe(true);
    });

    it('should throw on remove non-existent sponsor', async () => {
        prisma.sponsor.findUnique.mockResolvedValue(null);
        await expect(service.remove('invalid')).rejects.toThrow(NotFoundException);
    });

    it('should find sponsors by event', async () => {
        const result = await service.findByEvent('event-1', {});
        expect(prisma.sponsor.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { eventId: 'event-1' } }),
        );
        expect(result).toHaveLength(1);
    });
});
