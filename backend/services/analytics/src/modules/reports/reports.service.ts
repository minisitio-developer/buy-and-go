import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../infra/database/prisma.service';
import { CacheService } from '@eventos-ai/cache';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class ReportsService {
    private readonly logger = new Logger(ReportsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly cache: CacheService,
        private readonly metrics: MetricsService,
    ) {}

    async create(data: {
        organizationId: string;
        name: string;
        type: string;
        query?: any;
        schedule?: string;
    }) {
        return this.prisma.analyticsReport.create({
            data: {
                organizationId: data.organizationId,
                name: data.name,
                type: data.type,
                query: data.query || {},
                schedule: data.schedule,
            },
        });
    }

    async findByOrganization(organizationId: string, type?: string) {
        const where: any = { organizationId };
        if (type) where.type = type;
        return this.prisma.analyticsReport.findMany({ where, orderBy: { createdAt: 'desc' } });
    }

    async findById(id: string) {
        const report = await this.prisma.analyticsReport.findUnique({ where: { id } });
        if (!report) throw new NotFoundException('Report not found');
        return report;
    }

    async update(id: string, data: any) {
        await this.findById(id);
        return this.prisma.analyticsReport.update({ where: { id }, data });
    }

    async remove(id: string) {
        await this.findById(id);
        return this.prisma.analyticsReport.delete({ where: { id } });
    }

    async execute(id: string, filters?: Record<string, any>) {
        const report = await this.findById(id);
        const query = { ...(report.query as Record<string, any>), ...filters };

        const cacheKey = `report:${id}:${JSON.stringify(query)}`;
        const cached = await this.cache.get<any>(cacheKey);
        if (cached) return cached;

        const result = await this.runQuery(report.type, query);

        await this.cache.set(cacheKey, result, 60);

        await this.prisma.analyticsReport.update({
            where: { id },
            data: { lastRunAt: new Date() },
        });

        return result;
    }

    private async runQuery(type: string, query: Record<string, any>): Promise<any> {
        switch (type) {
            case 'event_summary':
                return this.queryEventSummary(query);
            case 'checkin_evolution':
                return this.queryCheckinEvolution(query);
            case 'revenue_analysis':
                return this.queryRevenueAnalysis(query);
            case 'attendee_breakdown':
                return this.queryAttendeeBreakdown(query);
            case 'custom':
                return this.queryCustom(query);
            default:
                return { error: `Unknown report type: ${type}` };
        }
    }

    private async queryEventSummary(query: Record<string, any>) {
        const { eventId } = query;
        if (!eventId) return { error: 'eventId required' };

        const analytics = await this.prisma.eventAnalytics.findUnique({ where: { eventId } });
        if (!analytics) return { error: 'No analytics found for event' };

        return analytics;
    }

    private async queryCheckinEvolution(query: Record<string, any>) {
        const { eventId, period = 'hourly' } = query;
        const where: any = { metricKey: 'checkin.count' };
        if (eventId) where.eventId = eventId;
        if (period) where.period = period;

        return this.prisma.analyticsMetric.findMany({
            where,
            orderBy: { recordedAt: 'asc' },
        });
    }

    private async queryRevenueAnalysis(query: Record<string, any>) {
        const { eventId, startDate, endDate } = query;
        const where: any = { metricKey: { in: ['revenue.total', 'revenue.avg_ticket'] } };
        if (eventId) where.eventId = eventId;
        if (startDate || endDate) {
            where.recordedAt = {};
            if (startDate) where.recordedAt.gte = new Date(startDate);
            if (endDate) where.recordedAt.lte = new Date(endDate);
        }

        return this.prisma.analyticsMetric.findMany({ where, orderBy: { recordedAt: 'asc' } });
    }

    private async queryAttendeeBreakdown(query: Record<string, any>) {
        const { eventId } = query;
        if (!eventId) return { error: 'eventId required' };

        const analytics = await this.prisma.eventAnalytics.findUnique({ where: { eventId } });
        if (!analytics) return {};

        return {
            topCities: analytics.topCities,
            ageDistribution: analytics.ageDistribution,
            genderDistribution: analytics.genderDistribution,
        };
    }

    private async queryCustom(query: Record<string, any>) {
        const {
            metricKeys, eventId, organizationId,
            aggregation = 'sum', period,
            startDate, endDate, groupBy,
        } = query;

        const result: any = {};

        if (metricKeys && typeof metricKeys === 'string') {
            const keys = metricKeys.split(',');
            for (const key of keys) {
                result[key] = await this.metrics.query({
                    metricKey: key.trim(),
                    eventId,
                    organizationId,
                    aggregation,
                    period,
                    startDate,
                    endDate,
                    groupBy,
                });
            }
        }

        return result;
    }

    @Cron('0 */5 * * * *')
    async runScheduledReports(): Promise<void> {
        this.logger.log('Running scheduled reports (every 5 min)...');

        const reports = await this.prisma.analyticsReport.findMany({
            where: { schedule: { not: null } },
        });

        for (const report of reports) {
            try {
                await this.execute(report.id);
                this.logger.log(`Scheduled report ${report.id} (${report.name}) executed`);
            } catch (error) {
                this.logger.error(`Failed to execute scheduled report ${report.id}`, error);
            }
        }
    }
}
