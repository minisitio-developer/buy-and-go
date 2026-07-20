import {
    Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class MetricsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: {
        sponsorId: string;
        eventId: string;
        visitors?: number;
        avgStayTime?: number;
        revisitRate?: number;
        peakHour?: number;
        profile?: any;
    }) {
        const sponsor = await this.prisma.sponsor.findUnique({ where: { id: data.sponsorId } });
        if (!sponsor) throw new NotFoundException('Sponsor not found');

        return this.prisma.sponsorMetric.create({
            data: {
                sponsorId: data.sponsorId,
                eventId: data.eventId,
                visitors: data.visitors || 0,
                avgStayTime: data.avgStayTime,
                revisitRate: data.revisitRate,
                peakHour: data.peakHour,
                profile: data.profile || {},
            },
        });
    }

    async findBySponsor(sponsorId: string, params: { days?: number }) {
        const sponsor = await this.prisma.sponsor.findUnique({ where: { id: sponsorId } });
        if (!sponsor) throw new NotFoundException('Sponsor not found');

        const where: any = { sponsorId };
        if (params.days) {
            const since = new Date();
            since.setDate(since.getDate() - params.days);
            where.recordedAt = { gte: since };
        }

        const metrics = await this.prisma.sponsorMetric.findMany({
            where,
            orderBy: { recordedAt: 'desc' },
        });

        const aggregated = metrics.length
            ? {
                  totalVisitors: metrics.reduce((s, m) => s + m.visitors, 0),
                  avgStayTime: metrics.reduce((s, m) => s + (m.avgStayTime || 0), 0) / metrics.length,
                  avgRevisitRate: metrics.reduce((s, m) => s + (m.revisitRate || 0), 0) / metrics.length,
                  records: metrics.length,
                  periodStart: metrics[metrics.length - 1]?.recordedAt,
                  periodEnd: metrics[0]?.recordedAt,
              }
            : null;

        return { sponsorId, aggregated, metrics };
    }

    async getRoi(sponsorId: string) {
        const sponsor = await this.prisma.sponsor.findUnique({
            where: { id: sponsorId },
            include: {
                payments: { where: { status: 'paid' } },
                metrics: { orderBy: { recordedAt: 'desc' } },
            },
        });
        if (!sponsor) throw new NotFoundException('Sponsor not found');

        const totalInvestment = sponsor.payments.reduce((s, p) => s + Number(p.value), 0);
        const totalVisitors = sponsor.metrics.reduce((s, m) => s + m.visitors, 0);
        const costPerVisitor = totalVisitors > 0 ? totalInvestment / totalVisitors : 0;

        return {
            sponsorId: sponsor.id,
            sponsorName: sponsor.name,
            totalInvestment,
            totalVisitors,
            costPerVisitor,
            paymentCount: sponsor.payments.length,
            metricRecords: sponsor.metrics.length,
        };
    }
}
