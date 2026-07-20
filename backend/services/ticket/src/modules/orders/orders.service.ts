import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { EventBusService, TOPICS } from '@eventos-ai/messaging';

@Injectable()
export class OrdersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventBus: EventBusService,
    ) {}

    async create(data: {
        organizationId: string;
        eventId: string;
        userId: string;
        items: Array<{ ticketTypeId: string; quantity: number }>;
        couponCode?: string;
    }) {
        let total = 0;
        const itemsData = [];

        for (const item of data.items) {
            const ticketType = await this.prisma.ticketType.findUnique({
                where: { id: item.ticketTypeId },
            });

            if (!ticketType) throw new NotFoundException(`Ticket type ${item.ticketTypeId} not found`);
            if (ticketType.status !== 'active') throw new BadRequestException('Ticket type is not active');

            const available = ticketType.quantity - ticketType.sold;
            if (item.quantity > available) {
                throw new BadRequestException(`Only ${available} tickets available for ${ticketType.name}`);
            }

            const itemTotal = Number(ticketType.price) * item.quantity;
            total += itemTotal;

            itemsData.push({
                ticketTypeId: item.ticketTypeId,
                unitPrice: ticketType.price,
                quantity: item.quantity,
                total: itemTotal,
            });
        }

        const fee = total * 0.05;
        let discount = 0;

        if (data.couponCode) {
            const coupon = await this.prisma.coupon.findUnique({
                where: { eventId_code: { eventId: data.eventId, code: data.couponCode.toUpperCase() } },
            });

            if (!coupon || !coupon.isActive) {
                throw new BadRequestException('Invalid or inactive coupon');
            }
            if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
                throw new BadRequestException('Coupon usage limit reached');
            }
            if (coupon.validUntil && new Date() > coupon.validUntil) {
                throw new BadRequestException('Coupon expired');
            }

            const discAmount = coupon.discountType === 'percentage'
                ? (total * Number(coupon.discountValue)) / 100
                : Number(coupon.discountValue);
            discount = Math.min(discAmount, total);

            await this.prisma.coupon.update({
                where: { id: coupon.id },
                data: { usedCount: { increment: 1 } },
            });
        }

        const netTotal = total - discount;

        const order = await this.prisma.order.create({
            data: {
                organizationId: data.organizationId,
                eventId: data.eventId,
                userId: data.userId,
                total,
                discount,
                fee,
                netTotal,
                items: { create: itemsData },
            },
            include: { items: true },
        });

        for (const item of itemsData) {
            await this.prisma.ticketType.update({
                where: { id: item.ticketTypeId },
                data: { sold: { increment: item.quantity } },
            });
        }

        this.eventBus.publish(
            TOPICS.TICKET.ORDER_CREATED,
            TOPICS.TICKET.ORDER_CREATED,
            {
                orderId: order.id,
                organizationId: data.organizationId,
                eventId: data.eventId,
                userId: data.userId,
                items: itemsData,
                total,
                discount,
                fee,
                netTotal,
                couponCode: data.couponCode,
                createdAt: order.createdAt,
            },
        ).catch(err => console.error('Failed to publish order.created event', err));

        return order;
    }

    async findById(id: string) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!order) throw new NotFoundException('Order not found');
        return order;
    }

    async findByEvent(eventId: string, page = 1, perPage = 20) {
        const where = { eventId };
        const [data, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { createdAt: 'desc' },
                include: { items: true },
            }),
            this.prisma.order.count({ where }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async confirmPayment(id: string, paymentMethod: string, paymentId: string) {
        const order = await this.findById(id);
        if (order.status !== 'pending') throw new BadRequestException('Order is not pending');

        const updated = await this.prisma.order.update({
            where: { id },
            data: { status: 'confirmed', paymentMethod, paymentId, paidAt: new Date() },
        });

        this.eventBus.publish(
            TOPICS.TICKET.ORDER_CONFIRMED,
            TOPICS.TICKET.ORDER_CONFIRMED,
            {
                orderId: id,
                eventId: updated.eventId,
                userId: updated.userId,
                paymentMethod,
                paymentId,
                paidAt: new Date(),
                netTotal: Number(updated.netTotal),
            },
        ).catch(err => console.error('Failed to publish order.confirmed event', err));

        return updated;
    }

    async refund(id: string) {
        const order = await this.findById(id);
        if (order.status !== 'confirmed') throw new BadRequestException('Order is not confirmed');

        for (const item of order.items) {
            await this.prisma.ticketType.update({
                where: { id: item.ticketTypeId },
                data: { sold: { decrement: item.quantity } },
            });
        }

        const updated = await this.prisma.order.update({
            where: { id },
            data: { status: 'refunded', refundedAt: new Date() },
        });

        this.eventBus.publish(
            TOPICS.TICKET.ORDER_REFUNDED,
            TOPICS.TICKET.ORDER_REFUNDED,
            {
                orderId: id,
                eventId: updated.eventId,
                refundedAt: new Date(),
                items: order.items.map(i => ({
                    ticketTypeId: i.ticketTypeId,
                    quantity: i.quantity,
                })),
            },
        ).catch(err => console.error('Failed to publish order.refunded event', err));

        return updated;
    }
}
