import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@eventos-ai/auth';
import { EventBusModule } from '@eventos-ai/messaging';
import { DatabaseModule } from './infra/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { ConfigModule } from './modules/config/config.module';
import { FeatureFlagsModule } from './modules/feature-flags/feature-flags.module';
import { AuditModule } from './modules/audit/audit.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { LocalizationModule } from './modules/localization/localization.module';
import { ConsumersModule } from './infra/consumers/consumers.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        AuthModule.forRoot(),
        EventBusModule.forRoot(),
        DatabaseModule, HealthModule, ConfigModule, FeatureFlagsModule,
        AuditModule, SchedulerModule, LocalizationModule, ConsumersModule,
    ],
})
export class AppModule {}
