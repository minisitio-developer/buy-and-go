import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { StripeService } from '../../infra/stripe/stripe.service';
import { EventBusService, TOPICS } from '@eventos-ai/messaging';

@Injectable()
export class OrdersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly stripe: StripeService,
        private readonly eventBus: EventBusService,
    ) {}

    async create(data: {
        organizationId: string;
        buyerId: string;
        items: Array<{ productId: string; quantity: number }>;
        paymentMethod?: string;
        successUrl?: string;
        cancelUrl?: string;
    }) {
        const productIds = data.items.map(i => i.productId);
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds }, status: 'active' },
        });

        if (products.length !== productIds.length) {
            const found = new Set(products.map(p => p.id));
            const missing = productIds.filter(id => !found.has(id));
            throw new NotFoundException(`Products not found or inactive: ${missing.join(', ')}`);
        }

        const productMap = new Map(products.map(p => [p.id, p]));
        const lineItems = data.items.map(item => {
            const product = productMap.get(item.productId)!;
            return {
                productId: item.productId,
                name: product.name,
                price: Number(product.price),
                quantity: item.quantity,
                total: Number(product.price) * item.quantity,
            };
        });

        const total = lineItems.reduce((sum, item) => sum + item.total, 0);

        const order = await this.prisma.order.create({
            data: {
                organizationId: data.organizationId,
                buyerId: data.buyerId,
                items: lineItems,
                total,
                paymentMethod: data.paymentMethod || 'stripe',
                status: 'pending',
            },
        });

        if (data.paymentMethod === 'pix' || data.paymentMethod === 'boleto') {
            const boletoResult = await this.stripe.createBoletoPayment({
                items: lineItems,
                successUrl: data.successUrl || `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/orders/${order.id}/success`,
                metadata: { orderId: order.id },
            });

            await this.prisma.order.update({
                where: { id: order.id },
                data: { paymentId: boletoResult.id },
            });

            return { order, payment: boletoResult };
        }

        const checkout = await this.stripe.createCheckoutSession({
            items: lineItems,
            successUrl: data.successUrl || `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/orders/${order.id}/success`,
            cancelUrl: data.cancelUrl || `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/orders/${order.id}/cancel`,
            metadata: { orderId: order.id },
        });

        await this.prisma.order.update({
            where: { id: order.id },
            data: { paymentId: checkout.id },
        });

        this.eventBus.publish(
            TOPICS.MARKETPLACE?.ORDER_CREATED || 'marketplace.order.created',
            'marketplace-order-created',
            { orderId: order.id, buyerId: data.buyerId, total, items: lineItems },
        ).catch(err => console.error('Failed to publish order created', err));

        return { order, payment: checkout };
    }

    async findByBuyer(buyerId: string, params: {
        status?: string; page?: number; perPage?: number;
    }) {
        const { status, page = 1, perPage = 20 } = params;
        const where: any = { buyerId };
        if (status) where.status = status;

        const [data, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.order.count({ where }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async findByOrganization(organizationId: string, params: {
        status?: string; page?: number; perPage?: number;
    }) {
        const { status, page = 1, perPage = 20 } = params;
        const where: any = { organizationId };
        if (status) where.status = status;

        const [data, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.order.count({ where }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async findById(id: string) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order) throw new NotFoundException('Order not found');
        return order;
    }

    async updateStatus(id: string, status: string) {
        await this.findById(id);
        return this.prisma.order.update({ where: { id }, data: { status } });
    }
}
