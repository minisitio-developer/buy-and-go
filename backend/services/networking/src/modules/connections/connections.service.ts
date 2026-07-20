import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class ConnectionsService {
    constructor(private readonly prisma: PrismaService) {}

    async requestConnection(eventId: string, participantId1: string, participantId2: string, message?: string) {
        const existing = await this.prisma.connection.findUnique({
            where: {
                eventId_participantId1_participantId2: { eventId, participantId1, participantId2 },
            },
        });
        if (existing) throw new ConflictException('Connection already exists');

        const [p1, p2] = [participantId1, participantId2].sort();
        const match = await this.prisma.match.findUnique({
            where: {
                eventId_participantId1_participantId2: { eventId, participantId1: p1, participantId2: p2 },
            },
        });
        if (!match) throw new NotFoundException('No match found. Compute matches first.');

        await this.prisma.match.update({
            where: { id: match.id },
            data: { status: 'connected', connectedAt: new Date() },
        });

        return this.prisma.connection.create({
            data: { eventId, participantId1, participantId2, message },
        });
    }

    async acceptConnection(id: string) {
        const connection = await this.prisma.connection.findUnique({ where: { id } });
        if (!connection) throw new NotFoundException('Connection not found');

        const [p1, p2] = [connection.participantId1, connection.participantId2].sort();
        await this.prisma.match.updateMany({
            where: {
                eventId: connection.eventId,
                participantId1: p1,
                participantId2: p2,
            },
            data: { status: 'connected', connectedAt: new Date() },
        });

        return connection;
    }

    async declineConnection(id: string) {
        const connection = await this.prisma.connection.findUnique({ where: { id } });
        if (!connection) throw new NotFoundException('Connection not found');

        const [p1, p2] = [connection.participantId1, connection.participantId2].sort();
        await this.prisma.match.updateMany({
            where: {
                eventId: connection.eventId,
                participantId1: p1,
                participantId2: p2,
            },
            data: { status: 'declined' },
        });

        await this.prisma.connection.delete({ where: { id } });
        return { declined: true };
    }

    async findByEvent(eventId: string, params: {
        participantId?: string; page?: number; perPage?: number;
    }) {
        const { participantId, page = 1, perPage = 20 } = params;
        const where: any = { eventId };
        if (participantId) {
            where.OR = [
                { participantId1: participantId },
                { participantId2: participantId },
            ];
        }

        const [data, total] = await Promise.all([
            this.prisma.connection.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { connectedAt: 'desc' },
                include: {
                    participant1: { select: { participantId: true, industry: true, role: true, company: true } },
                    participant2: { select: { participantId: true, industry: true, role: true, company: true } },
                },
            }),
            this.prisma.connection.count({ where }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async findById(id: string) {
        const connection = await this.prisma.connection.findUnique({
            where: { id },
            include: {
                participant1: true,
                participant2: true,
            },
        });
        if (!connection) throw new NotFoundException('Connection not found');
        return connection;
    }
}
