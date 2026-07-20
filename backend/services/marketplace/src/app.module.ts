import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from '@eventos-ai/auth';
import { EventBusModule } from '@eventos-ai/messaging';
import { DatabaseModule } from './infra/database/database.module';
import { StripeModule } from './infra/stripe/stripe.module';
import { ConsumersModule } from './infra/consumers/consumers.module';
import { HealthModule } from './modules/health/health.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { DownloadsModule } from './modules/downloads/downloads.module';

@Module({
    imports: [
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 200 }]),
        AuthModule.forRoot(),
        EventBusModule.forRoot(),
        DatabaseModule, StripeModule, ConsumersModule,
        HealthModule, ProductsModule, OrdersModule,
        SubscriptionsModule, ReviewsModule, DownloadsModule,
    ],
})
export class AppModule {}
