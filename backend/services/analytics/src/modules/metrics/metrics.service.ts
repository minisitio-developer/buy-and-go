import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../infra/database/prisma.service';
import { CacheService } from '@eventos-ai/cache';

type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max';

interface RecordMetricDto {
    organizationId: string;
    eventId?: string;
    name: string;
    metricKey: string;
    value: number;
    dimensions?: Record<string, any>;
    period?: string;
    recordedAt?: string;
}

interface QueryMetricsDto {
    metricKey: string;
    organizationId?: string;
    eventId?: string;
    aggregation?: AggregationType;
    period?: string;
    startDate?: string;
    endDate?: string;
    groupBy?: string;
}

@Injectable()
export class MetricsService {
    private readonly logger = new Logger(MetricsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly cache: CacheService,
    ) {}

    async record(data: RecordMetricDto) {
        return this.prisma.analyticsMetric.create({
            data: {
                organizationId: data.organizationId,
                eventId: data.eventId,
                name: data.name,
                metricKey: data.metricKey,
                value: data.value,
                dimensions: data.dimensions || {},
                period: data.period || 'raw',
                recordedAt: data.recordedAt ? new Date(data.recordedAt) : new Date(),
            },
        });
    }

    async recordMany(metrics: RecordMetricDto[]) {
        return this.prisma.analyticsMetric.createMany({
            data: metrics.map(m => ({
                organizationId: m.organizationId,
                eventId: m.eventId,
                name: m.name,
                metricKey: m.metricKey,
                value: m.value,
                dimensions: m.dimensions || {},
                period: m.period || 'raw',
                recordedAt: m.recordedAt ? new Date(m.recordedAt) : new Date(),
            })),
        });
    }

    async query(params: QueryMetricsDto) {
        const {
            metricKey, organizationId, eventId,
            aggregation = 'sum', period,
            startDate, endDate, groupBy,
        } = params;

        const cacheKey = `metrics:query:${JSON.stringify(params)}`;
        const cached = await this.cache.get<any>(cacheKey);
        if (cached) return cached;

        const where: any = { metricKey };
        if (organizationId) where.organizationId = organizationId;
        if (eventId) where.eventId = eventId;
        if (period) where.period = period;
        if (startDate || endDate) {
            where.recordedAt = {};
            if (startDate) where.recordedAt.gte = new Date(startDate);
            if (endDate) where.recordedAt.lte = new Date(endDate);
        }

        let result: any;

        if (groupBy) {
            result = await this.prisma.analyticsMetric.groupBy({
                by: [groupBy as any],
                where,
                _sum: aggregation === 'sum' ? { value: true } : undefined,
                _avg: aggregation === 'avg' ? { value: true } : undefined,
                _count: aggregation === 'count' ? { value: true } : undefined,
                _min: aggregation === 'min' ? { value: true } : undefined,
                _max: aggregation === 'max' ? { value: true } : undefined,
                orderBy: { [groupBy]: 'asc' },
            });

            result = result.map((r: any) => ({
                group: r[groupBy as string],
                value: this.extractAggValue(r, aggregation),
            }));
        } else if (period === 'hourly' || period === 'daily' || period === 'weekly' || period === 'monthly') {
            const records = await this.prisma.analyticsMetric.findMany({
                where: { ...where, period },
                orderBy: { recordedAt: 'asc' },
            });

            result = this.aggregateTimeSeries(records, aggregation);
        } else {
            const records = await this.prisma.analyticsMetric.findMany({
                where,
                orderBy: { recordedAt: 'desc' },
                take: 1000,
            });

            result = {
                aggregation,
                value: this.computeAggregation(records.map(r => r.value), aggregation),
                count: records.length,
                records: records.slice(0, 100),
            };
        }

        await this.cache.set(cacheKey, result, 60, { tags: ['metrics'] });
        return result;
    }

    private extractAggValue(record: any, aggregation: AggregationType): number {
        switch (aggregation) {
            case 'sum': return record._sum?.value ?? 0;
            case 'avg': return record._avg?.value ?? 0;
            case 'count': return record._count?.value ?? 0;
            case 'min': return record._min?.value ?? 0;
            case 'max': return record._max?.value ?? 0;
        }
    }

    private aggregateTimeSeries(records: any[], aggregation: AggregationType): any {
        if (aggregation === 'count') {
            return records.map(r => ({ period: r.recordedAt, value: r.value }));
        }

        return {
            aggregation,
            data: records.map(r => ({ period: r.recordedAt, value: r.value })),
        };
    }

    private computeAggregation(values: number[], aggregation: AggregationType): number {
        if (values.length === 0) return 0;

        switch (aggregation) {
            case 'sum': return values.reduce((a, b) => a + b, 0);
            case 'avg': return values.reduce((a, b) => a + b, 0) / values.length;
            case 'count': return values.length;
            case 'min': return Math.min(...values);
            case 'max': return Math.max(...values);
        }
    }

    @Cron('0 */5 * * * *')
    async aggregateRawMetrics(): Promise<void> {
        this.logger.log('Aggregating raw metrics into time-series periods...');
        const now = new Date();
        const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);

        try {
            const rawMetrics = await this.prisma.analyticsMetric.findMany({
                where: { period: 'raw', recordedAt: { gte: fiveMinAgo } },
            });

            const hourlyKeys = new Map<string, { values: number[]; metric: any }>();
            const dailyKeys = new Map<string, { values: number[]; metric: any }>();

            for (const m of rawMetrics) {
                const hourlyKey = `${m.organizationId}:${m.eventId || ''}:${m.metricKey}:hourly`;
                const dailyKey = `${m.organizationId}:${m.eventId || ''}:${m.metricKey}:daily`;

                if (!hourlyKeys.has(hourlyKey)) {
                    hourlyKeys.set(hourlyKey, { values: [], metric: m });
                }
                if (!dailyKeys.has(dailyKey)) {
                    dailyKeys.set(dailyKey, { values: [], metric: m });
                }
                hourlyKeys.get(hourlyKey)!.values.push(m.value);
                dailyKeys.get(dailyKey)!.values.push(m.value);
            }

            const batch: RecordMetricDto[] = [];

            for (const [, { values, metric }] of hourlyKeys) {
                batch.push({
                    organizationId: metric.organizationId,
                    eventId: metric.eventId,
                    name: metric.name,
                    metricKey: metric.metricKey,
                    value: values.reduce((a: number, b: number) => a + b, 0) / values.length,
                    dimensions: { aggregated: true, sourceCount: values.length },
                    period: 'hourly',
                    recordedAt: now.toISOString(),
                });
            }

            for (const [, { values, metric }] of dailyKeys) {
                batch.push({
                    organizationId: metric.organizationId,
                    eventId: metric.eventId,
                    name: metric.name,
                    metricKey: metric.metricKey,
                    value: values.reduce((a: number, b: number) => a + b, 0) / values.length,
                    dimensions: { aggregated: true, sourceCount: values.length },
                    period: 'daily',
                    recordedAt: now.toISOString(),
                });
            }

            if (batch.length > 0) {
                await this.recordMany(batch);
                this.logger.log(`Aggregated ${batch.length} metric(s) into time-series periods`);
            }
        } catch (error) {
            this.logger.error('Error aggregating raw metrics', error);
        }
    }

    @Cron('0 0 * * * *')
    async aggregateDailyMetrics(): Promise<void> {
        this.logger.log('Running daily metric aggregation (hourly -> daily)...');
        const now = new Date();

        try {
            const hourlyMetrics = await this.prisma.analyticsMetric.findMany({
                where: { period: 'hourly', recordedAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } },
            });

            const dailyMap = new Map<string, { values: number[]; metric: any }>();

            for (const m of hourlyMetrics) {
                const key = `${m.organizationId}:${m.eventId || ''}:${m.metricKey}`;
                if (!dailyMap.has(key)) dailyMap.set(key, { values: [], metric: m });
                dailyMap.get(key)!.values.push(m.value);
            }

            const batch: RecordMetricDto[] = [];
            for (const [, { values, metric }] of dailyMap) {
                const avgValue = values.reduce((a: number, b: number) => a + b, 0) / values.length;
                const existingDaily = await this.prisma.analyticsMetric.findFirst({
                    where: {
                        metricKey: metric.metricKey,
                        eventId: metric.eventId,
                        period: 'daily',
                        recordedAt: {
                            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                            lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
                        },
                    },
                });

                if (!existingDaily) {
                    batch.push({
                        organizationId: metric.organizationId,
                        eventId: metric.eventId,
                        name: metric.name,
                        metricKey: metric.metricKey,
                        value: avgValue,
                        dimensions: { aggregated: true, sourceCount: values.length },
                        period: 'daily',
                        recordedAt: now.toISOString(),
                    });
                }
            }

            if (batch.length > 0) {
                await this.recordMany(batch);
                this.logger.log(`Created ${batch.length} daily aggregation(s)`);
            }
        } catch (error) {
            this.logger.error('Error in daily metric aggregation', error);
        }
    }
}
