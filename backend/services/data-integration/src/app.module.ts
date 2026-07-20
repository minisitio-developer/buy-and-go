import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@eventos-ai/auth';
import { EventBusModule } from '@eventos-ai/messaging';
import { DatabaseModule } from './infra/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { RunsModule } from './modules/runs/runs.module';
import { ConnectorsModule } from './modules/connectors/connectors.module';
import { SyncModule } from './modules/sync/sync.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ScheduleModule.forRoot(),
        AuthModule.forRoot(),
        EventBusModule.forRoot(),
        DatabaseModule,
        HealthModule,
        IntegrationsModule,
        RunsModule,
        ConnectorsModule,
        SyncModule,
    ],
})
export class AppModule {}
