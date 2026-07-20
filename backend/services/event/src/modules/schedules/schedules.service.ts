import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class SchedulesService {
    constructor(private readonly prisma: PrismaService) {}

    async create(eventId: string, data: {
        name: string;
        startTime: string;
        endTime: string;
        speaker?: string;
        description?: string;
        room?: string;
        capacity?: number;
        type?: string;
        hasCertificate?: boolean;
    }) {
        const event = await this.prisma.event.findUnique({ where: { id: eventId } });
        if (!event || event.deletedAt) {
            throw new NotFoundException('Event not found');
        }

        return this.prisma.eventSchedule.create({
            data: {
                eventId,
                name: data.name,
                startTime: new Date(data.startTime),
                endTime: new Date(data.endTime),
                speaker: data.speaker,
                description: data.description,
                room: data.room,
                capacity: data.capacity,
                type: data.type,
                hasCertificate: data.hasCertificate ?? false,
            },
        });
    }

    async findByEvent(eventId: string) {
        return this.prisma.eventSchedule.findMany({
            where: { eventId },
            orderBy: { startTime: 'asc' },
        });
    }

    async update(id: string, data: any) {
        const schedule = await this.prisma.eventSchedule.findUnique({ where: { id } });
        if (!schedule) {
            throw new NotFoundException('Schedule not found');
        }

        return this.prisma.eventSchedule.update({ where: { id }, data });
    }

    async remove(id: string) {
        const schedule = await this.prisma.eventSchedule.findUnique({ where: { id } });
        if (!schedule) {
            throw new NotFoundException('Schedule not found');
        }

        return this.prisma.eventSchedule.delete({ where: { id } });
    }
}
