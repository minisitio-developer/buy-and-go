import { Injectable, Logger } from '@nestjs/common';
import { EventBusService, TOPICS, DomainEvent } from '@eventos-ai/messaging';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PaymentConsumer {
    private readonly logger = new Logger(PaymentConsumer.name);

    constructor(
        private readonly eventBus: EventBusService,
        private readonly prisma: PrismaService,
    ) {}

    async onModuleInit(): Promise<void> {
        await this.eventBus.subscribe(
            TOPICS.TICKET.ORDER_CREATED,
            'payment-order-created',
            this.handleOrderCreated.bind(this),
        );

        this.logger.log('Payment consumer initialized');
    }

    private async handleOrderCreated(event: DomainEvent): Promise<void> {
        const { orderId, eventId, userId, organizationId, netTotal } = event.payload;

        this.logger.log(`Order created: ${orderId} for event ${eventId}, amount ${netTotal}`);

        try {
            await this.prisma.payment.create({
                data: {
                    organizationId,
                    eventId,
                    userId,
                    orderId,
                    amount: netTotal,
                    currency: 'BRL',
                    fee: 0,
                    total: netTotal,
                    method: 'pending',
                    status: 'pending',
                    installments: 1,
                },
            });
        } catch (error) {
            this.logger.error(`Error creating payment for order ${orderId}`, error);
        }
    }
}
