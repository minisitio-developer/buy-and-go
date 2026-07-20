import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from '@eventos-ai/auth';
import { EventBusModule } from '@eventos-ai/messaging';
import { EventStoreModule } from '@eventos-ai/event-store';
import { OutboxModule } from '@eventos-ai/outbox';
import { DatabaseModule } from './infra/database/database.module';
import { ElasticsearchModule } from './infra/elasticsearch/elasticsearch.module';
import { ConsumersModule } from './infra/consumers/consumers.module';
import { HealthModule } from './modules/health/health.module';
import { SearchModule } from './modules/search/search.module';

@Module({
    imports: [
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 200 }]),
        AuthModule.forRoot(),
        EventBusModule.forRoot(),
        EventStoreModule.forRoot(),
        OutboxModule.forRoot(),
        DatabaseModule,
        ElasticsearchModule,
        ConsumersModule,
        HealthModule,
        SearchModule,
    ],
})
export class AppModule {}
