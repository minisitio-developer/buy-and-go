import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from '@eventos-ai/auth';
import { EventBusModule } from '@eventos-ai/messaging';
import { DatabaseModule } from './infra/database/database.module';
import { AttendeesModule } from './modules/attendees/attendees.module';
import { CheckInsModule } from './modules/checkins/checkins.module';
import { SyncModule } from './modules/sync/sync.module';
import { HealthModule } from './modules/health/health.module';
import { FaceModule } from './modules/face/face.module';
import { AiClientModule } from './infra/clients/ai-client.module';
import { GatewaysModule } from './infra/gateways/gateways.module';
import { ConsumersModule } from './infra/consumers/consumers.module';

@Module({
    imports: [
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 200 }]),
        AuthModule.forRoot(),
        EventBusModule.forRoot(),
        DatabaseModule, AttendeesModule, CheckInsModule, SyncModule,
        HealthModule, FaceModule, AiClientModule, GatewaysModule,
        ConsumersModule,
    ],
})
export class AppModule {}
