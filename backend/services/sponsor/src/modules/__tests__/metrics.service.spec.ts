import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from '../metrics/metrics.service';
import { PrismaService } from '../../infra/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('MetricsService', () => {
    let service: MetricsService;
    let prisma: any;

    const mockDate = new Date('2026-01-01T00:00:00.000Z');

    const mockSponsor = {
        id: 'sponsor-1',
        name: 'Acme Corp',
        eventId: 'event-1',
        tier: 'silver',
        status: 'active',
        payments: [
            { id: 'pay-1', status: 'paid', value: 50000 },
            { id: 'pay-2', status: 'paid', value: 25000 },
        ],
        metrics: [
            { id: 'met-1', visitors: 1200, avgStayTime: 15, revisitRate: 0.3, recordedAt: new Date('2026-01-02') },
            { id: 'met-2', visitors: 800, avgStayTime: 12, revisitRate: 0.25, recordedAt: new Date('2026-01-01') },
        ],
    };

    const mockMetric = {
        id: 'met-1',
        sponsorId: 'sponsor-1',
        eventId: 'event-1',
        visitors: 500,
        avgStayTime: 10,
        revisitRate: 0.2,
        peakHour: 14,
        profile: { gender: 'mixed', ageRange: '25-40' },
        recordedAt: mockDate,
    };

    beforeEach(async () => {
        prisma = {
            sponsor: { findUnique: jest.fn().mockResolvedValue(mockSponsor) },
            sponsorMetric: {
                create: jest.fn().mockResolvedValue(mockMetric),
                findMany: jest.fn().mockResolvedValue([mockMetric]),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MetricsService,
                { provide: PrismaService, useValue: prisma },
            ],
        }).compile();

        service = module.get<MetricsService>(MetricsService);
    });

    it('should create metric', async () => {
        const result = await service.create({
            sponsorId: 'sponsor-1',
            eventId: 'event-1',
            visitors: 500,
            avgStayTime: 10,
            revisitRate: 0.2,
            peakHour: 14,
            profile: { gender: 'mixed' },
        });

        expect(prisma.sponsorMetric.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    sponsorId: 'sponsor-1',
                    visitors: 500,
                }),
            }),
        );
        expect(result).toEqual(mockMetric);
    });

    it('should throw on non-existent sponsor for metric', async () => {
        prisma.sponsor.findUnique.mockResolvedValue(null);

        await expect(
            service.create({ sponsorId: 'invalid', eventId: 'event-1' }),
        ).rejects.toThrow(NotFoundException);
    });

    it('should find metrics by sponsor', async () => {
        const result = await service.findBySponsor('sponsor-1', {});

        expect(result.sponsorId).toBe('sponsor-1');
        expect(result.metrics).toHaveLength(1);
        expect(result.aggregated).toBeDefined();
    });

    it('should aggregate metrics correctly', async () => {
        const result = await service.findBySponsor('sponsor-1', {});

        expect(result.aggregated!.totalVisitors).toBe(500);
        expect(result.aggregated!.avgStayTime).toBe(10);
        expect(result.aggregated!.avgRevisitRate).toBe(0.2);
        expect(result.aggregated!.records).toBe(1);
    });

    it('should aggregate multiple metrics correctly', async () => {
        prisma.sponsorMetric.findMany.mockResolvedValue([
            { visitors: 1200, avgStayTime: 15, revisitRate: 0.3, recordedAt: new Date('2026-01-02') },
            { visitors: 800, avgStayTime: 12, revisitRate: 0.25, recordedAt: new Date('2026-01-01') },
        ]);

        const result = await service.findBySponsor('sponsor-1', {});

        expect(result.aggregated!.totalVisitors).toBe(2000);
        expect(result.aggregated!.avgStayTime).toBe(13.5);
        expect(result.aggregated!.avgRevisitRate).toBe(0.275);
        expect(result.aggregated!.records).toBe(2);
    });

    it('should return null aggregated when no metrics', async () => {
        prisma.sponsorMetric.findMany.mockResolvedValue([]);

        const result = await service.findBySponsor('sponsor-1', {});
        expect(result.aggregated).toBeNull();
    });

    it('should filter metrics by days', async () => {
        await service.findBySponsor('sponsor-1', { days: 7 });

        expect(prisma.sponsorMetric.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    sponsorId: 'sponsor-1',
                    recordedAt: expect.objectContaining({ gte: expect.any(Date) }),
                }),
            }),
        );
    });

    it('should throw on non-existent sponsor for findBySponsor', async () => {
        prisma.sponsor.findUnique.mockResolvedValue(null);

        await expect(service.findBySponsor('invalid', {})).rejects.toThrow(NotFoundException);
    });

    it('should calculate ROI', async () => {
        const result = await service.getRoi('sponsor-1');

        expect(result.sponsorId).toBe('sponsor-1');
        expect(result.sponsorName).toBe('Acme Corp');
        expect(result.totalInvestment).toBe(75000);
        expect(result.totalVisitors).toBe(2000);
        expect(result.costPerVisitor).toBe(37.5);
        expect(result.paymentCount).toBe(2);
        expect(result.metricRecords).toBe(2);
    });

    it('should handle zero visitors ROI', async () => {
        prisma.sponsor.findUnique.mockResolvedValue({
            ...mockSponsor,
            payments: [{ status: 'paid', value: 50000 }],
            metrics: [],
        });

        const result = await service.getRoi('sponsor-1');
        expect(result.totalInvestment).toBe(50000);
        expect(result.totalVisitors).toBe(0);
        expect(result.costPerVisitor).toBe(0);
    });

    it('should throw on non-existent sponsor for ROI', async () => {
        prisma.sponsor.findUnique.mockResolvedValue(null);
        await expect(service.getRoi('invalid')).rejects.toThrow(NotFoundException);
    });
});
