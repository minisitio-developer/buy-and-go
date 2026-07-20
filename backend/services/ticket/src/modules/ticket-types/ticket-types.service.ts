import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class TicketTypesService {
    constructor(private readonly prisma: PrismaService) {}

    async create(eventId: string, data: {
        name: string;
        price: number;
        quantity: number;
        description?: string;
        minPerOrder?: number;
        maxPerOrder?: number;
        saleStart?: string;
        saleEnd?: string;
    }) {
        return this.prisma.ticketType.create({
            data: {
                eventId,
                name: data.name,
                price: data.price,
                quantity: data.quantity,
                description: data.description,
                minPerOrder: data.minPerOrder ?? 1,
                maxPerOrder: data.maxPerOrder ?? 10,
                saleStart: data.saleStart ? new Date(data.saleStart) : undefined,
                saleEnd: data.saleEnd ? new Date(data.saleEnd) : undefined,
            },
        });
    }

    async findByEvent(eventId: string) {
        return this.prisma.ticketType.findMany({
            where: { eventId },
            include: { lots: { orderBy: { startDate: 'asc' } } },
            orderBy: { sortOrder: 'asc' },
        });
    }

    async findById(id: string) {
        const tt = await this.prisma.ticketType.findUnique({
            where: { id },
            include: { lots: true },
        });
        if (!tt) throw new NotFoundException('Ticket type not found');
        return tt;
    }

    async update(id: string, data: any) {
        await this.findById(id);
        return this.prisma.ticketType.update({ where: { id }, data });
    }

    async remove(id: string) {
        await this.findById(id);
        return this.prisma.ticketType.delete({ where: { id } });
    }

    async getSoldCount(id: string) {
        const result = await this.prisma.orderItem.aggregate({
            where: { ticketTypeId: id },
            _sum: { quantity: true },
        });
        return result._sum.quantity || 0;
    }
}
