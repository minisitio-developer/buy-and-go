import {
    Controller, Post, Req, Headers, RawBodyRequest, Logger,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { EventBusService, TOPICS } from '@eventos-ai/messaging';
import { PrismaService } from '../database/prisma.service';

@Controller('webhooks')
export class WebhooksController {
    private readonly logger = new Logger(WebhooksController.name);

    constructor(
        private readonly stripe: StripeService,
        private readonly eventBus: EventBusService,
        private readonly prisma: PrismaService,
    ) {}

    @Post('stripe')
    async handleStripeWebhook(
        @Req() req: RawBodyRequest<Request>,
        @Headers('stripe-signature') signature: string,
    ) {
        if (!signature) {
            this.logger.warn('Missing stripe-signature header');
            return { received: true };
        }

        let event: any;
        try {
            event = await this.stripe.constructWebhookEvent(
                req.rawBody ?? Buffer.from(''),
                signature,
            );
        } catch (err: any) {
            this.logger.error(`Webhook signature verification failed: ${err.message}`);
            return { received: true };
        }

        this.logger.log(`Processing Stripe event: ${event.type}`);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                await this.handleCheckoutCompleted(session);
                break;
            }
            case 'checkout.session.expired': {
                const session = event.data.object;
                await this.handleCheckoutExpired(session);
                break;
            }
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                await this.handleSubscriptionUpdated(subscription);
                break;
            }
            default:
                this.logger.log(`Unhandled event type: ${event.type}`);
        }

        return { received: true };
    }

    private async handleCheckoutCompleted(session: any) {
        const orderId = session.metadata?.orderId;
        if (!orderId) {
            this.logger.warn('Checkout completed without orderId metadata');
            return;
        }

        try {
            const order = await this.prisma.order.findUnique({ where: { id: orderId } });
            if (!order) {
                this.logger.warn(`Order ${orderId} not found for checkout completion`);
                return;
            }

            await this.prisma.order.update({
                where: { id: orderId },
                data: {
                    status: 'completed',
                    paymentId: session.payment_intent || session.id,
                },
            });

            this.eventBus.publish(
                TOPICS.MARKETPLACE?.ORDER_COMPLETED || 'marketplace.order.completed',
                'marketplace-order-completed',
                { orderId, paymentId: session.payment_intent, total: order.total },
            ).catch(err => this.logger.error('Failed to publish order completed', err));

            this.logger.log(`Order ${orderId} completed via Stripe`);
        } catch (error) {
            this.logger.error(`Error completing order ${orderId}`, error);
        }
    }

    private async handleCheckoutExpired(session: any) {
        const orderId = session.metadata?.orderId;
        if (!orderId) return;

        try {
            await this.prisma.order.update({
                where: { id: orderId },
                data: { status: 'expired' },
            });
            this.logger.log(`Order ${orderId} expired`);
        } catch (error) {
            this.logger.error(`Error expiring order ${orderId}`, error);
        }
    }

    private async handleSubscriptionUpdated(subscription: any) {
        const subscriptionId = subscription.id;
        const status = subscription.status === 'active' ? 'active'
            : subscription.status === 'past_due' ? 'past_due'
            : subscription.status === 'canceled' ? 'canceled'
            : subscription.status === 'incomplete' ? 'incomplete'
            : 'unknown';

        try {
            const existing = await this.prisma.subscription.findFirst({
                where: { planId: subscriptionId },
            });

            if (existing) {
                await this.prisma.subscription.update({
                    where: { id: existing.id },
                    data: {
                        status,
                        currentPeriodStart: new Date(subscription.current_period_start * 1000),
                        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    },
                });
                this.logger.log(`Subscription ${existing.id} updated to ${status}`);
            }
        } catch (error) {
            this.logger.error(`Error updating subscription ${subscriptionId}`, error);
        }
    }
}
