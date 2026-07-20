import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class AttendeesService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: {
        organizationId: string;
        eventId: string;
        name: string;
        email: string;
        phone?: string;
        document?: string;
        company?: string;
        position?: string;
        category?: string;
    }) {
        const existing = await this.prisma.attendee.findUnique({
            where: { eventId_email: { eventId: data.eventId, email: data.email.toLowerCase() } },
        });
        if (existing) throw new ConflictException('Attendee already registered for this event');

        const attendee = await this.prisma.attendee.create({
            data: {
                organizationId: data.organizationId,
                eventId: data.eventId,
                name: data.name,
                email: data.email.toLowerCase(),
                phone: data.phone,
                document: data.document,
                company: data.company,
                position: data.position,
                category: data.category || 'visitor',
            },
        });

        await this.prisma.credential.create({
            data: {
                attendeeId: attendee.id,
                eventId: data.eventId,
                qrCode: crypto.randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase(),
            },
        });

        return attendee;
    }

    async findByEvent(eventId: string, params: {
        category?: string; search?: string; page?: number; perPage?: number;
    }) {
        const { category, search, page = 1, perPage = 20 } = params;
        const where: any = { eventId };
        if (category) where.category = category;
        if (search) where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { document: { contains: search } },
        ];

        const [data, total] = await Promise.all([
            this.prisma.attendee.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { name: 'asc' },
                include: { credential: true, checkIns: true },
            }),
            this.prisma.attendee.count({ where }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async findById(id: string) {
        const attendee = await this.prisma.attendee.findUnique({
            where: { id },
            include: { credential: true, checkIns: true },
        });
        if (!attendee) throw new NotFoundException('Attendee not found');
        return attendee;
    }

    async update(id: string, data: any) {
        await this.findById(id);
        return this.prisma.attendee.update({ where: { id }, data });
    }

    async batchImport(eventId: string, organizationId: string, attendees: Array<{
        name: string; email: string; category?: string; company?: string;
    }>) {
        const results = { created: 0, skipped: 0, errors: [] as string[] };

        for (const a of attendees) {
            try {
                await this.create({ organizationId, eventId, ...a });
                results.created++;
            } catch (e: any) {
                if (e instanceof ConflictException) {
                    results.skipped++;
                } else {
                    results.errors.push(`${a.email}: ${e.message}`);
                }
            }
        }

        return results;
    }

    async remove(id: string) {
        await this.findById(id);
        await this.prisma.credential.deleteMany({ where: { attendeeId: id } });
        await this.prisma.checkIn.deleteMany({ where: { attendeeId: id } });
        return this.prisma.attendee.delete({ where: { id } });
    }
}
