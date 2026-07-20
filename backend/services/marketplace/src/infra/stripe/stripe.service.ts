import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private readonly logger = new Logger(StripeService.name);
    private readonly stripe: Stripe;

    constructor() {
        const key = process.env.STRIPE_SECRET_KEY || '';
        this.stripe = new Stripe(key, { apiVersion: '2024-11-20.acacia' });
    }

    async createCheckoutSession(params: {
        items: Array<{ name: string; price: number; quantity: number }>;
        successUrl: string;
        cancelUrl: string;
        metadata?: Record<string, string>;
        customerEmail?: string;
    }) {
        const lineItems = params.items.map(item => ({
            price_data: {
                currency: 'brl',
                product_data: { name: item.name },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card', 'boleto'],
            line_items: lineItems,
            mode: 'payment',
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
            metadata: params.metadata,
            customer_email: params.customerEmail,
        });

        return { id: session.id, url: session.url };
    }

    async createSubscriptionCheckout(params: {
        priceId: string;
        successUrl: string;
        cancelUrl: string;
        metadata?: Record<string, string>;
        customerEmail?: string;
    }) {
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: params.priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
            metadata: params.metadata,
            customer_email: params.customerEmail,
        });

        return { id: session.id, url: session.url };
    }

    async constructWebhookEvent(payload: Buffer, signature: string): Promise<Stripe.Event> {
        const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
        return this.stripe.webhooks.constructEvent(payload, signature, secret);
    }

    async retrieveCheckoutSession(sessionId: string) {
        return this.stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items'] });
    }

    async retrieveSubscription(subscriptionId: string) {
        return this.stripe.subscriptions.retrieve(subscriptionId);
    }

    async cancelSubscription(subscriptionId: string) {
        return this.stripe.subscriptions.cancel(subscriptionId);
    }

    async createBoletoPayment(params: {
        items: Array<{ name: string; price: number; quantity: number }>;
        successUrl: string;
        metadata?: Record<string, string>;
        customerEmail?: string;
        customerTaxId?: string;
        customerName?: string;
    }) {
        const lineItems = params.items.map(item => ({
            price_data: {
                currency: 'brl',
                product_data: { name: item.name },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['boleto'],
            line_items: lineItems,
            mode: 'payment',
            success_url: params.successUrl,
            cancel_url: params.successUrl,
            metadata: params.metadata,
            customer_email: params.customerEmail,
            payment_intent_data: {
                payment_method_options: {
                    boleto: {
                        expires_after_days: 3,
                    },
                },
            },
        });

        const paymentIntent = await this.stripe.paymentIntents.retrieve(
            session.payment_intent as string,
        );

        const boleto = paymentIntent.next_action?.boleto_display_details;

        return {
            id: session.id,
            url: session.url,
            boletoUrl: boleto?.hosted_voucher_url,
            boletoBarcode: boleto?.pdf,
            expiresAt: boleto?.expires_at,
        };
    }

    async generateSignedUrl(filePath: string): Promise<string> {
        this.logger.warn(`Signed URL not implemented for ${filePath}, returning direct path`);
        return filePath;
    }
}
