import { Test, TestingModule } from '@nestjs/testing';
import { BoothsService } from '../booths/booths.service';
import { PrismaService } from '../../infra/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('BoothsService', () => {
    let service: BoothsService;
    let prisma: any;

    const mockDate = new Date('2026-01-01T00:00:00.000Z');

    const mockSponsor = {
        id: 'sponsor-1',
        name: 'Acme Corp',
        tier: 'silver',
        logoUrl: null,
    };

    const mockBooth = {
        id: 'booth-1',
        sponsorId: 'sponsor-1',
        eventId: 'event-1',
        name: 'Booth A',
        location: 'Hall Principal',
        size: '10x10',
        status: 'active',
        checkins: 0,
        createdAt: mockDate,
        sponsor: { name: 'Acme Corp', tier: 'silver' },
    };

    beforeEach(async () => {
        prisma = {
            sponsor: { findUnique: jest.fn().mockResolvedValue(mockSponsor) },
            sponsorBooth: {
                create: jest.fn().mockResolvedValue(mockBooth),
                findMany: jest.fn().mockResolvedValue([mockBooth]),
                findUnique: jest.fn().mockResolvedValue(mockBooth),
                update: jest.fn().mockResolvedValue({ ...mockBooth, checkins: 1 }),
                delete: jest.fn().mockResolvedValue(mockBooth),
                count: jest.fn().mockResolvedValue(1),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BoothsService,
                { provide: PrismaService, useValue: prisma },
            ],
        }).compile();

        service = module.get<BoothsService>(BoothsService);
    });

    it('should create booth', async () => {
        const result = await service.create({
            sponsorId: 'sponsor-1',
            eventId: 'event-1',
            name: 'Booth A',
            location: 'Hall Principal',
            size: '10x10',
        });

        expect(prisma.sponsorBooth.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    sponsorId: 'sponsor-1',
                    name: 'Booth A',
                }),
            }),
        );
        expect(result).toEqual(mockBooth);
    });

    it('should throw when creating with non-existent sponsor', async () => {
        prisma.sponsor.findUnique.mockResolvedValue(null);

        await expect(
            service.create({
                sponsorId: 'invalid',
                eventId: 'event-1',
                name: 'Booth X',
            }),
        ).rejects.toThrow(NotFoundException);
    });

    it('should list booths with pagination', async () => {
        const result = await service.findAll({ eventId: 'event-1' });

        expect(prisma.sponsorBooth.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { eventId: 'event-1' } }),
        );
        expect(result.data).toHaveLength(1);
        expect(result.pagination.total).toBe(1);
    });

    it('should find one booth', async () => {
        const result = await service.findOne('booth-1');
        expect(result).toEqual(mockBooth);
    });

    it('should throw on non-existent booth', async () => {
        prisma.sponsorBooth.findUnique.mockResolvedValue(null);
        await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
    });

    it('should update booth', async () => {
        const result = await service.update('booth-1', { name: 'Booth A Updated' });
        expect(prisma.sponsorBooth.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'booth-1' },
                data: { name: 'Booth A Updated' },
            }),
        );
        expect(result).toBeDefined();
    });

    it('should throw on update non-existent booth', async () => {
        prisma.sponsorBooth.findUnique.mockResolvedValue(null);
        await expect(service.update('invalid', {})).rejects.toThrow(NotFoundException);
    });

    it('should remove booth', async () => {
        const result = await service.remove('booth-1');
        expect(prisma.sponsorBooth.delete).toHaveBeenCalledWith({ where: { id: 'booth-1' } });
        expect(result.deleted).toBe(true);
    });

    it('should throw on remove non-existent booth', async () => {
        prisma.sponsorBooth.findUnique.mockResolvedValue(null);
        await expect(service.remove('invalid')).rejects.toThrow(NotFoundException);
    });

    it('should find booths by event', async () => {
        const result = await service.findByEvent('event-1');
        expect(prisma.sponsorBooth.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { eventId: 'event-1' } }),
        );
        expect(result).toHaveLength(1);
    });

    it('should track check-in', async () => {
        const result = await service.trackCheckin('booth-1');
        expect(prisma.sponsorBooth.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'booth-1' },
                data: { checkins: { increment: 1 } },
            }),
        );
        expect(result.checkins).toBe(1);
    });

    it('should throw on track check-in non-existent booth', async () => {
        prisma.sponsorBooth.findUnique.mockResolvedValue(null);
        await expect(service.trackCheckin('invalid')).rejects.toThrow(NotFoundException);
    });
});
