import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class RoomsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(eventId: string, data: { name: string; capacity?: number; type?: string }) {
        const event = await this.prisma.event.findUnique({ where: { id: eventId } });
        if (!event || event.deletedAt) {
            throw new NotFoundException('Event not found');
        }

        return this.prisma.eventRoom.create({
            data: { eventId, ...data },
        });
    }

    async findByEvent(eventId: string) {
        return this.prisma.eventRoom.findMany({
            where: { eventId },
            orderBy: { sortOrder: 'asc' },
        });
    }

    async remove(id: string) {
        const room = await this.prisma.eventRoom.findUnique({ where: { id } });
        if (!room) {
            throw new NotFoundException('Room not found');
        }

        return this.prisma.eventRoom.delete({ where: { id } });
    }
}
