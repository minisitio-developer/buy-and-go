import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { EventBusService, TOPICS } from '@eventos-ai/messaging';

@Injectable()
export class PaymentsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventBus: EventBusService,
    ) {}

    async create(data: {
        organizationId: string;
        orderId?: string;
        eventId: string;
        userId: string;
        amount: number;
        currency?: string;
        method: string;
        installments?: number;
    }) {
        const amount = data.amount;
        const fee = 0;
        const total = amount + fee;

        return this.prisma.payment.create({
            data: {
                organizationId: data.organizationId,
                eventId: data.eventId,
                userId: data.userId,
                amount,
                currency: data.currency || 'BRL',
                fee,
                total,
                method: data.method || 'credit_card',
                status: 'pending',
                installments: data.installments || 1,
            },
        });
    }

    async findAll(params: {
        eventId?: string;
        status?: string;
        method?: string;
        page?: number;
        perPage?: number;
    }) {
        const { eventId, status, method, page = 1, perPage = 20 } = params;
        const where: any = {};
        if (eventId) where.eventId = eventId;
        if (status) where.status = status;
        if (method) where.method = method;

        const [data, total] = await Promise.all([
            this.prisma.payment.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.payment.count({ where }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async findById(id: string) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
            include: {
                transactions: true,
                refunds: true,
                pixPayment: true,
                boletoPayment: true,
            },
        });
        if (!payment) throw new NotFoundException('Payment not found');
        return payment;
    }

    async refund(id: string, data: {
        amount?: number;
        reason?: string;
        initiatedBy?: string;
        approvedBy?: string;
    }) {
        const payment = await this.findById(id);
        if (payment.status === 'refunded') {
            throw new BadRequestException('Payment already refunded');
        }
        if (payment.status !== 'completed') {
            throw new BadRequestException('Only completed payments can be refunded');
        }

        const amount = data.amount || Number(payment.amount);

        const refund = await this.prisma.refund.create({
            data: {
                paymentId: id,
                amount,
                reason: data.reason,
                status: 'pending',
                initiatedBy: data.initiatedBy || 'user',
                approvedBy: data.approvedBy,
            },
        });

        if (data.approvedBy) {
            await this.prisma.payment.update({
                where: { id },
                data: { status: 'refunded' },
            });

            this.eventBus.publish(
                TOPICS.PAYMENT.PAYMENT_REFUNDED,
                TOPICS.PAYMENT.PAYMENT_REFUNDED,
                {
                    refundId: refund.id,
                    paymentId: id,
                    organizationId: payment.organizationId,
                    eventId: payment.eventId,
                    amount: Number(amount),
                    reason: data.reason,
                    status: 'approved',
                    refundedAt: new Date(),
                },
            ).catch(err => console.error('Failed to publish payment.refunded event', err));
        }

        return refund;
    }

    async capture(id: string) {
        const payment = await this.findById(id);
        if (payment.status !== 'pending') {
            throw new BadRequestException('Only pending payments can be captured');
        }

        return this.prisma.payment.update({
            where: { id },
            data: { status: 'processing' },
        });
    }

    async complete(id: string, gatewayResponse?: Record<string, any>) {
        const payment = await this.findById(id);
        if (payment.status !== 'processing') {
            throw new BadRequestException('Only processing payments can be completed');
        }

        const updated = await this.prisma.payment.update({
            where: { id },
            data: { status: 'completed' },
        });

        this.eventBus.publish(
            TOPICS.PAYMENT.PAYMENT_COMPLETED,
            TOPICS.PAYMENT.PAYMENT_COMPLETED,
            {
                paymentId: id,
                organizationId: updated.organizationId,
                eventId: updated.eventId,
                userId: updated.userId,
                orderId: updated.orderId,
                amount: Number(updated.amount),
                fee: Number(updated.fee),
                total: Number(updated.total),
                method: updated.method,
                currency: updated.currency,
                installments: updated.installments,
                completedAt: new Date(),
                gatewayResponse,
            },
        ).catch(err => console.error('Failed to publish payment.completed event', err));

        return updated;
    }

    async fail(id: string, reason: string, gatewayResponse?: Record<string, any>) {
        const payment = await this.findById(id);

        const updated = await this.prisma.payment.update({
            where: { id },
            data: { status: 'failed' },
        });

        this.eventBus.publish(
            TOPICS.PAYMENT.PAYMENT_FAILED,
            TOPICS.PAYMENT.PAYMENT_FAILED,
            {
                paymentId: id,
                organizationId: updated.organizationId,
                eventId: updated.eventId,
                userId: updated.userId,
                orderId: updated.orderId,
                amount: Number(updated.amount),
                method: updated.method,
                reason,
                failedAt: new Date(),
                gatewayResponse,
            },
        ).catch(err => console.error('Failed to publish payment.failed event', err));

        return updated;
    }
}
