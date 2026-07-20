import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@eventos-ai/auth';
import { EventBusModule } from '@eventos-ai/messaging';
import { CacheModule } from '@eventos-ai/cache';
import { DatabaseModule } from './infra/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { DashboardsModule } from './modules/dashboards/dashboards.module';
import { ReportsModule } from './modules/reports/reports.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { EventAnalyticsModule } from './modules/event-analytics/event-analytics.module';
import { ConsumersModule } from './infra/consumers/consumers.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        AuthModule.forRoot(),
        EventBusModule.forRoot(),
        CacheModule.forRoot({ store: 'memory', ttl: 300, global: true }),
        DatabaseModule, HealthModule, DashboardsModule, ReportsModule,
        MetricsModule, EventAnalyticsModule, ConsumersModule,
    ],
})
export class AppModule {}
