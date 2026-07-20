import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../infra/database/prisma.service';
import { CacheService } from '@eventos-ai/cache';
import { MetricsService } from '../metrics/metrics.service';

interface CheckinRecord {
    attendeeId: string;
    method: string;
    attendeeName?: string;
    attendeeCategory?: string;
    attendeeCompany?: string;
}

interface OrderRecord {
    orderId: string;
    userId: string;
    netTotal: number;
    ticketCount: number;
}

interface PaymentRecord {
    paymentId: string;
    orderId: string;
    amount: number;
    paymentMethod?: string;
}

interface TicketRecord {
    ticketId: string;
    orderId: string;
    attendeeDocument?: string;
    attendeeName?: string;
    ticketCategory?: string;
}

@Injectable()
export class EventAnalyticsService {
    private readonly logger = new Logger(EventAnalyticsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly cache: CacheService,
        private readonly metrics: MetricsService,
    ) {}

    async getByEvent(eventId: string) {
        const cacheKey = `event-analytics:${eventId}`;
        const cached = await this.cache.get<any>(cacheKey);
        if (cached) return cached;

        let analytics = await this.prisma.eventAnalytics.findUnique({ where: { eventId } });

        if (!analytics) {
            analytics = await this.computeFullAnalytics(eventId);
        }

        await this.cache.set(cacheKey, analytics, 60, { tags: [`event-analytics:${eventId}`] });
        return analytics;
    }

    async getTimeline(eventId: string, period: string = 'hourly') {
        return this.prisma.analyticsMetric.findMany({
            where: {
                eventId,
                period,
                metricKey: { in: ['checkin.count', 'revenue.total', 'tickets.sold'] },
            },
            orderBy: { recordedAt: 'asc' },
        });
    }

    async recordCheckin(eventId: string, data: CheckinRecord): Promise<void> {
        await this.prisma.$transaction(async (tx) => {
            await tx.eventAnalytics.upsert({
                where: { eventId },
                update: {
                    checkedIn: { increment: 1 },
                    lastUpdatedAt: new Date(),
                },
                create: {
                    eventId,
                    totalAttendees: 0,
                    checkedIn: 1,
                    ticketsSold: 0,
                    revenue: 0,
                    avgTicketPrice: 0,
                    occupancyRate: 0,
                    topCities: [],
                    hourlyFlow: [],
                    dailyFlow: [],
                    ageDistribution: {},
                    genderDistribution: {},
                    lastUpdatedAt: new Date(),
                },
            });
        });

        await this.metrics.record({
            organizationId: '',
            eventId,
            name: 'Check-in Count',
            metricKey: 'checkin.count',
            value: 1,
            dimensions: { method: data.method, category: data.attendeeCategory },
            period: 'raw',
        });

        await this.cache.invalidateTag(`event-analytics:${eventId}`);
    }

    async recordOrder(eventId: string, data: OrderRecord): Promise<void> {
        await this.prisma.$transaction(async (tx) => {
            const analytics = await tx.eventAnalytics.findUnique({ where: { eventId } });

            const currentRevenue = analytics?.revenue || 0;
            const currentSold = analytics?.ticketsSold || 0;
            const currentAttendees = analytics?.totalAttendees || 0;
            const newRevenue = currentRevenue + data.netTotal;
            const newSold = currentSold + data.ticketCount;
            const newAttendees = currentAttendees + data.ticketCount;

            await tx.eventAnalytics.upsert({
                where: { eventId },
                update: {
                    ticketsSold: newSold,
                    revenue: newRevenue,
                    totalAttendees: newAttendees,
                    avgTicketPrice: newSold > 0 ? newRevenue / newSold : 0,
                    lastUpdatedAt: new Date(),
                },
                create: {
                    eventId,
                    totalAttendees: data.ticketCount,
                    checkedIn: 0,
                    ticketsSold: data.ticketCount,
                    revenue: data.netTotal,
                    avgTicketPrice: data.netTotal / data.ticketCount,
                    occupancyRate: 0,
                    topCities: [],
                    hourlyFlow: [],
                    dailyFlow: [],
                    ageDistribution: {},
                    genderDistribution: {},
                    lastUpdatedAt: new Date(),
                },
            });
        });

        await this.metrics.record({
            organizationId: '',
            eventId,
            name: 'Tickets Sold',
            metricKey: 'tickets.sold',
            value: data.ticketCount,
            dimensions: {},
            period: 'raw',
        });

        await this.metrics.record({
            organizationId: '',
            eventId,
            name: 'Revenue Total',
            metricKey: 'revenue.total',
            value: data.netTotal,
            dimensions: {},
            period: 'raw',
        });

        await this.cache.invalidateTag(`event-analytics:${eventId}`);
    }

    async recordPayment(eventId: string, data: PaymentRecord): Promise<void> {
        await this.metrics.record({
            organizationId: '',
            eventId,
            name: 'Payment Amount',
            metricKey: 'payment.amount',
            value: data.amount,
            dimensions: { paymentMethod: data.paymentMethod },
            period: 'raw',
        });

        await this.cache.invalidateTag(`event-analytics:${eventId}`);
    }

    async recordTicketIssued(eventId: string, data: TicketRecord): Promise<void> {
        const city = ''; // Would come from attendee profile lookup
        const ageGroup = ''; // Would come from attendee profile
        const gender = ''; // Would come from attendee profile

        await this.metrics.record({
            organizationId: '',
            eventId,
            name: 'Ticket Issued',
            metricKey: 'ticket.issued',
            value: 1,
            dimensions: {
                category: data.ticketCategory,
                city,
                ageGroup,
                gender,
            },
            period: 'raw',
        });

        await this.cache.invalidateTag(`event-analytics:${eventId}`);
    }

    async computeFullAnalytics(eventId: string) {
        this.logger.log(`Computing full analytics for event ${eventId}`);

        const [checkinCount, ticketCount, revenueResult, hourlyCheckins, dailyCheckins] = await Promise.all([
            this.prisma.analyticsMetric.aggregate({
                where: { eventId, metricKey: 'checkin.count' },
                _sum: { value: true },
            }),
            this.prisma.analyticsMetric.aggregate({
                where: { eventId, metricKey: 'tickets.sold' },
                _sum: { value: true },
            }),
            this.prisma.analyticsMetric.aggregate({
                where: { eventId, metricKey: 'revenue.total' },
                _sum: { value: true },
            }),
            this.prisma.$queryRaw`
                SELECT EXTRACT(HOUR FROM recorded_at) as hour, SUM(value) as count
                FROM analytics_metrics
                WHERE event_id = ${eventId}::uuid AND metric_key = 'checkin.count'
                AND recorded_at >= NOW() - INTERVAL '24 hours'
                GROUP BY hour ORDER BY hour
            `,
            this.prisma.$queryRaw`
                SELECT DATE(recorded_at) as date, SUM(value) as count
                FROM analytics_metrics
                WHERE event_id = ${eventId}::uuid AND metric_key = 'checkin.count'
                AND recorded_at >= NOW() - INTERVAL '7 days'
                GROUP BY date ORDER BY date
            `,
        ]);

        const checkedIn = checkinCount._sum?.value || 0;
        const ticketsSold = ticketCount._sum?.value || 0;
        const revenue = revenueResult._sum?.value || 0;
        const avgTicketPrice = ticketsSold > 0 ? revenue / ticketsSold : 0;
        const occupancyRate = ticketsSold > 0 ? (checkedIn / ticketsSold) * 100 : 0;

        const dimensionResult = await this.prisma.analyticsMetric.findMany({
            where: { eventId, metricKey: 'ticket.issued' },
            select: { dimensions: true },
            take: 1000,
        });

        const cityCounts: Record<string, number> = {};
        const ageCounts: Record<string, number> = {};
        const genderCounts: Record<string, number> = {};

        for (const r of dimensionResult) {
            const dims = r.dimensions as Record<string, any>;
            if (dims.city) cityCounts[dims.city] = (cityCounts[dims.city] || 0) + 1;
            if (dims.ageGroup) ageCounts[dims.ageGroup] = (ageCounts[dims.ageGroup] || 0) + 1;
            if (dims.gender) genderCounts[dims.gender] = (genderCounts[dims.gender] || 0) + 1;
        }

        const topCities = Object.entries(cityCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([city, count]) => ({ city, count }));

        const analytics = await this.prisma.eventAnalytics.upsert({
            where: { eventId },
            update: {
                checkedIn,
                ticketsSold,
                revenue,
                avgTicketPrice,
                occupancyRate,
                topCities,
                hourlyFlow: hourlyCheckins,
                dailyFlow: dailyCheckins,
                ageDistribution: ageCounts,
                genderDistribution: genderCounts,
                lastUpdatedAt: new Date(),
            },
            create: {
                eventId,
                totalAttendees: ticketsSold,
                checkedIn,
                ticketsSold,
                revenue,
                avgTicketPrice,
                occupancyRate,
                topCities,
                hourlyFlow: hourlyCheckins,
                dailyFlow: dailyCheckins,
                ageDistribution: ageCounts,
                genderDistribution: genderCounts,
                lastUpdatedAt: new Date(),
            },
        });

        await this.cache.invalidateTag(`event-analytics:${eventId}`);
        return analytics;
    }

    async computeAllEvents(): Promise<{ processed: number }> {
        const eventIds = await this.prisma.analyticsMetric.findMany({
            where: { eventId: { not: null } },
            select: { eventId: true },
            distinct: ['eventId'],
        });

        const uniqueIds = [...new Set(eventIds.map(e => e.eventId).filter(Boolean))] as string[];
        let processed = 0;

        for (const eventId of uniqueIds) {
            try {
                await this.computeFullAnalytics(eventId);
                processed++;
            } catch (error) {
                this.logger.error(`Failed to compute analytics for event ${eventId}`, error);
            }
        }

        return { processed };
    }

    @Cron('0 */5 * * * *')
    async syncRecentAnalytics(): Promise<void> {
        this.logger.log('Syncing recent event analytics...');
        try {
            const recentMetrics = await this.prisma.analyticsMetric.findMany({
                where: {
                    eventId: { not: null },
                    recordedAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
                },
                select: { eventId: true },
                distinct: ['eventId'],
                take: 50,
            });

            const eventIds = [...new Set(recentMetrics.map(m => m.eventId).filter(Boolean))] as string[];

            for (const eventId of eventIds) {
                try {
                    await this.computeFullAnalytics(eventId);
                } catch (error) {
                    this.logger.error(`Failed to sync analytics for event ${eventId}`, error);
                }
            }
        } catch (error) {
            this.logger.error('Error syncing recent analytics', error);
        }
    }

    @Cron('0 0 * * * *')
    async dailyComputeAll(): Promise<void> {
        this.logger.log('Running daily full analytics computation...');
        await this.computeAllEvents();
    }
}
