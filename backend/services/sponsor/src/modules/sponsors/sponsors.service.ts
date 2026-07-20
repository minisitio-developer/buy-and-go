import {
    Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class SponsorsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: {
        organizationId: string;
        eventId: string;
        name: string;
        logoUrl?: string;
        description?: string;
        tier?: string;
        contractUrl?: string;
        value?: number;
        signedAt?: string;
    }) {
        const allowedTiers = ['diamond', 'gold', 'silver', 'bronze'];
        if (data.tier && !allowedTiers.includes(data.tier)) {
            throw new BadRequestException(`Invalid tier. Must be one of: ${allowedTiers.join(', ')}`);
        }

        return this.prisma.sponsor.create({
            data: {
                organizationId: data.organizationId,
                eventId: data.eventId,
                name: data.name,
                logoUrl: data.logoUrl,
                description: data.description,
                tier: (data.tier as any) || 'silver',
                contractUrl: data.contractUrl,
                value: data.value || undefined,
                signedAt: data.signedAt ? new Date(data.signedAt) : undefined,
            },
            include: { booths: true, payments: true },
        });
    }

    async findAll(params: {
        eventId?: string;
        tier?: string;
        status?: string;
        page?: number;
        perPage?: number;
    }) {
        const { eventId, tier, status, page = 1, perPage = 20 } = params;
        const where: any = {};
        if (eventId) where.eventId = eventId;
        if (tier) where.tier = tier;
        if (status) where.status = status;

        const [data, total] = await Promise.all([
            this.prisma.sponsor.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { createdAt: 'desc' },
                include: { booths: true, _count: { select: { metrics: true, payments: true } } },
            }),
            this.prisma.sponsor.count({ where }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async findOne(id: string) {
        const sponsor = await this.prisma.sponsor.findUnique({
            where: { id },
            include: {
                booths: true,
                metrics: { orderBy: { recordedAt: 'desc' }, take: 10 },
                payments: { orderBy: { dueDate: 'asc' } },
            },
        });
        if (!sponsor) throw new NotFoundException('Sponsor not found');
        return sponsor;
    }

    async update(id: string, data: any) {
        const sponsor = await this.prisma.sponsor.findUnique({ where: { id } });
        if (!sponsor) throw new NotFoundException('Sponsor not found');

        const allowedTiers = ['diamond', 'gold', 'silver', 'bronze'];
        if (data.tier && !allowedTiers.includes(data.tier)) {
            throw new BadRequestException(`Invalid tier. Must be one of: ${allowedTiers.join(', ')}`);
        }

        const updateData: any = { ...data };
        if (data.signedAt) updateData.signedAt = new Date(data.signedAt);
        if (data.value !== undefined) updateData.value = data.value;

        return this.prisma.sponsor.update({
            where: { id },
            data: updateData,
            include: { booths: true, payments: true },
        });
    }

    async remove(id: string) {
        const sponsor = await this.prisma.sponsor.findUnique({ where: { id } });
        if (!sponsor) throw new NotFoundException('Sponsor not found');

        await this.prisma.sponsorPayment.deleteMany({ where: { sponsorId: id } });
        await this.prisma.sponsorMetric.deleteMany({ where: { sponsorId: id } });
        await this.prisma.sponsorBooth.deleteMany({ where: { sponsorId: id } });
        await this.prisma.sponsor.delete({ where: { id } });

        return { deleted: true };
    }

    async findByEvent(eventId: string, params: { tier?: string }) {
        const where: any = { eventId };
        if (params.tier) where.tier = params.tier;

        return this.prisma.sponsor.findMany({
            where,
            orderBy: { tier: 'asc' },
            include: { booths: true },
        });
    }
}
