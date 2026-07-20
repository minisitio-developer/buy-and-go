import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from '@eventos-ai/auth';
import { EventBusModule } from '@eventos-ai/messaging';
import { DatabaseModule } from './infra/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PixModule } from './modules/pix/pix.module';
import { BoletoModule } from './modules/boleto/boleto.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { ConsumersModule } from './infra/consumers/consumers.module';

@Module({
    imports: [
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 200 }]),
        AuthModule.forRoot(),
        EventBusModule.forRoot(),
        DatabaseModule, HealthModule, PaymentsModule,
        PixModule, BoletoModule, GatewayModule,
        ConsumersModule,
    ],
})
export class AppModule {}
