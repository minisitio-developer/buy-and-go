import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class LotsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(ticketTypeId: string, data: {
        name: string;
        price: number;
        quantity: number;
        startDate: string;
        endDate: string;
    }) {
        return this.prisma.ticketLot.create({
            data: {
                ticketTypeId,
                name: data.name,
                price: data.price,
                quantity: data.quantity,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
            },
        });
    }

    async findByTicketType(ticketTypeId: string) {
        return this.prisma.ticketLot.findMany({
            where: { ticketTypeId },
            orderBy: { startDate: 'asc' },
        });
    }

    async update(id: string, data: any) {
        const lot = await this.prisma.ticketLot.findUnique({ where: { id } });
        if (!lot) throw new NotFoundException('Lot not found');
        return this.prisma.ticketLot.update({ where: { id }, data });
    }

    async remove(id: string) {
        const lot = await this.prisma.ticketLot.findUnique({ where: { id } });
        if (!lot) throw new NotFoundException('Lot not found');
        return this.prisma.ticketLot.delete({ where: { id } });
    }
}
