import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@eventos-ai/auth';
import { EventBusModule } from '@eventos-ai/messaging';
import { EventStoreModule } from '@eventos-ai/event-store';
import { OutboxModule } from '@eventos-ai/outbox';
import { DatabaseModule } from './infra/database/database.module';
import { ConsumersModule } from './infra/consumers/consumers.module';
import { HealthModule } from './modules/health/health.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { ExecutionsModule } from './modules/executions/executions.module';
import { TriggersModule } from './modules/triggers/triggers.module';
import { ActionsModule } from './modules/actions/actions.module';

@Module({
    imports: [
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 200 }]),
        ScheduleModule.forRoot(),
        AuthModule.forRoot(),
        EventBusModule.forRoot(),
        EventStoreModule.forRoot(),
        OutboxModule.forRoot(),
        DatabaseModule,
        ConsumersModule,
        HealthModule,
        WorkflowsModule,
        ExecutionsModule,
        TriggersModule,
        ActionsModule,
    ],
})
export class AppModule {}
