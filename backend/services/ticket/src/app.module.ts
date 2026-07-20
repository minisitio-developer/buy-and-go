import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from '@eventos-ai/auth';
import { EventBusModule } from '@eventos-ai/messaging';
import { DatabaseModule } from './infra/database/database.module';
import { TicketTypesModule } from './modules/ticket-types/ticket-types.module';
import { LotsModule } from './modules/lots/lots.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { OrdersModule } from './modules/orders/orders.module';
import { HealthModule } from './modules/health/health.module';

@Module({
    imports: [
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
        AuthModule.forRoot(),
        EventBusModule.forRoot(),
        DatabaseModule,
        TicketTypesModule,
        LotsModule,
        CouponsModule,
        OrdersModule,
        HealthModule,
    ],
})
export class AppModule {}
