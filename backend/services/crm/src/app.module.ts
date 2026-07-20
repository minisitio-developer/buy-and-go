import { Module } from '@nestjs/common';
import { AuthModule } from '@eventos-ai/auth';
import { EventBusModule } from '@eventos-ai/messaging';
import { DatabaseModule } from './infra/database/database.module';
import { PipelinesModule } from './modules/pipelines/pipelines.module';
import { DealsModule } from './modules/deals/deals.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { HealthModule } from './modules/health/health.module';
import { ConsumersModule } from './infra/consumers/consumers.module';

@Module({ imports: [AuthModule.forRoot(), EventBusModule.forRoot(), DatabaseModule, PipelinesModule, DealsModule, ContactsModule, HealthModule, ConsumersModule] })
export class AppModule {}
