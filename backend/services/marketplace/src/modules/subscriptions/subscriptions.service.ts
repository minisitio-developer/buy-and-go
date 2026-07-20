import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { StripeService } from '../../infra/stripe/stripe.service';
import { EventBusService, TOPICS } from '@eventos-ai/messaging';

@Injectable()
export class SubscriptionsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly stripe: StripeService,
        private readonly eventBus: EventBusService,
    ) {}

    async create(data: {
        organizationId: string;
        participantId: string;
        planId: string;
        priceId?: string;
        successUrl?: string;
        cancelUrl?: string;
    }) {
        const existing = await this.prisma.subscription.findFirst({
            where: {
                participantId: data.participantId,
                planId: data.planId,
                status: { in: ['active', 'past_due'] },
            },
        });

        if (existing) {
            throw new BadRequestException('User already has an active subscription to this plan');
        }

        const start = new Date();
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);

        const subscription = await this.prisma.subscription.create({
            data: {
                organizationId: data.organizationId,
                participantId: data.participantId,
                planId: data.planId,
                status: 'incomplete',
                currentPeriodStart: start,
                currentPeriodEnd: end,
            },
        });

        if (data.priceId) {
            const checkout = await this.stripe.createSubscriptionCheckout({
                priceId: data.priceId,
                successUrl: data.successUrl || `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/subscriptions/${subscription.id}/success`,
                cancelUrl: data.cancelUrl || `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/subscriptions/${subscription.id}/cancel`,
                metadata: { subscriptionId: subscription.id, organizationId: data.organizationId },
            });

            return { subscription, payment: checkout };
        }

        return { subscription };
    }

    async findAll(params: {
        organizationId?: string;
        participantId?: string;
        planId?: string;
        status?: string;
        page?: number;
        perPage?: number;
    }) {
        const { organizationId, participantId, planId, status, page = 1, perPage = 20 } = params;
        const where: any = {};
        if (organizationId) where.organizationId = organizationId;
        if (participantId) where.participantId = participantId;
        if (planId) where.planId = planId;
        if (status) where.status = status;

        const [data, total] = await Promise.all([
            this.prisma.subscription.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.subscription.count({ where }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async findById(id: string) {
        const subscription = await this.prisma.subscription.findUnique({ where: { id } });
        if (!subscription) throw new NotFoundException('Subscription not found');
        return subscription;
    }

    async cancel(id: string) {
        const subscription = await this.findById(id);
        if (subscription.status === 'canceled') {
            throw new BadRequestException('Subscription is already canceled');
        }

        if (subscription.planId.startsWith('sub_')) {
            try {
                await this.stripe.cancelSubscription(subscription.planId);
            } catch (err: any) {
                console.error('Failed to cancel Stripe subscription', err.message);
            }
        }

        const updated = await this.prisma.subscription.update({
            where: { id },
            data: { status: 'canceled' },
        });

        this.eventBus.publish(
            TOPICS.MARKETPLACE?.SUBSCRIPTION_CANCELED || 'marketplace.subscription.canceled',
            'marketplace-subscription-canceled',
            { subscriptionId: id, participantId: subscription.participantId, planId: subscription.planId },
        ).catch(err => console.error('Failed to publish subscription canceled', err));

        return updated;
    }

    async renew(id: string) {
        const subscription = await this.findById(id);
        if (subscription.status !== 'active' && subscription.status !== 'past_due') {
            throw new BadRequestException('Only active or past due subscriptions can be renewed');
        }

        const start = new Date();
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);

        return this.prisma.subscription.update({
            where: { id },
            data: {
                status: 'active',
                currentPeriodStart: start,
                currentPeriodEnd: end,
            },
        });
    }
}
