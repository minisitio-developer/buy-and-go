import {
    Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class BoothsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: {
        sponsorId: string;
        eventId: string;
        name: string;
        location?: string;
        size?: string;
        status?: string;
    }) {
        const sponsor = await this.prisma.sponsor.findUnique({ where: { id: data.sponsorId } });
        if (!sponsor) throw new NotFoundException('Sponsor not found');

        return this.prisma.sponsorBooth.create({ data: data as any });
    }

    async findAll(params: {
        eventId?: string;
        sponsorId?: string;
        page?: number;
        perPage?: number;
    }) {
        const { eventId, sponsorId, page = 1, perPage = 20 } = params;
        const where: any = {};
        if (eventId) where.eventId = eventId;
        if (sponsorId) where.sponsorId = sponsorId;

        const [data, total] = await Promise.all([
            this.prisma.sponsorBooth.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { createdAt: 'desc' },
                include: { sponsor: { select: { name: true, tier: true } } },
            }),
            this.prisma.sponsorBooth.count({ where }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async findOne(id: string) {
        const booth = await this.prisma.sponsorBooth.findUnique({
            where: { id },
            include: { sponsor: { select: { name: true, tier: true, logoUrl: true } } },
        });
        if (!booth) throw new NotFoundException('Booth not found');
        return booth;
    }

    async update(id: string, data: any) {
        const booth = await this.prisma.sponsorBooth.findUnique({ where: { id } });
        if (!booth) throw new NotFoundException('Booth not found');

        return this.prisma.sponsorBooth.update({ where: { id }, data });
    }

    async remove(id: string) {
        const booth = await this.prisma.sponsorBooth.findUnique({ where: { id } });
        if (!booth) throw new NotFoundException('Booth not found');

        await this.prisma.sponsorBooth.delete({ where: { id } });
        return { deleted: true };
    }

    async findByEvent(eventId: string) {
        return this.prisma.sponsorBooth.findMany({
            where: { eventId },
            orderBy: { name: 'asc' },
            include: { sponsor: { select: { name: true, tier: true, logoUrl: true } } },
        });
    }

    async trackCheckin(id: string) {
        const booth = await this.prisma.sponsorBooth.findUnique({ where: { id } });
        if (!booth) throw new NotFoundException('Booth not found');

        return this.prisma.sponsorBooth.update({
            where: { id },
            data: { checkins: { increment: 1 } },
        });
    }
}
