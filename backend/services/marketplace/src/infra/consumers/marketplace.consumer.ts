import { Injectable, Logger } from '@nestjs/common';
import { EventBusService, TOPICS, DomainEvent } from '@eventos-ai/messaging';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class MarketplaceConsumer {
    private readonly logger = new Logger(MarketplaceConsumer.name);

    constructor(
        private readonly eventBus: EventBusService,
        private readonly prisma: PrismaService,
    ) {}

    async onModuleInit(): Promise<void> {
        await this.eventBus.subscribe(
            TOPICS.TICKET?.ORDER_CONFIRMED || 'ticket.order.confirmed',
            'marketplace-order-confirmed',
            this.handleOrderConfirmed.bind(this),
        );

        await this.eventBus.subscribe(
            TOPICS.EVENT?.EVENT_CREATED || 'event.created',
            'marketplace-event-created',
            this.handleEventCreated.bind(this),
        );

        this.logger.log('Marketplace consumers initialized');
    }

    private async handleOrderConfirmed(event: DomainEvent): Promise<void> {
        const { orderId, eventId, userId, items } = event.payload;

        this.logger.log(`Order confirmed: ${orderId} for event ${eventId}`);

        if (items && Array.isArray(items)) {
            for (const item of items) {
                if (item.productId) {
                    try {
                        const product = await this.prisma.product.findUnique({
                            where: { id: item.productId },
                        });
                        if (product && product.type === 'ticket' && eventId) {
                            await this.prisma.product.update({
                                where: { id: item.productId },
                                data: {
                                    metadata: {
                                        ...(typeof product.metadata === 'object' && product.metadata ? product.metadata : {}),
                                        orderId,
                                        userId,
                                    },
                                },
                            });
                        }
                    } catch (error) {
                        this.logger.error(`Error updating product ${item.productId}`, error);
                    }
                }
            }
        }
    }

    private async handleEventCreated(event: DomainEvent): Promise<void> {
        this.logger.log(`Event created: ${event.payload?.eventId || event.payload?.id}`);
    }
}
