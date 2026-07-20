import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@eventos-ai/auth';
import { EventBusModule } from '@eventos-ai/messaging';
import { DatabaseModule } from './infra/database/database.module';
import { StorageModule } from './infra/storage/storage.module';
import { HealthModule } from './modules/health/health.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { GenerationModule } from './modules/generation/generation.module';
import { SignaturesModule } from './modules/signatures/signatures.module';
import { ConsumersModule } from './infra/consumers/consumers.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule.forRoot(),
        EventBusModule.forRoot(),
        DatabaseModule, StorageModule, HealthModule,
        DocumentsModule, TemplatesModule, GenerationModule,
        SignaturesModule, ConsumersModule,
    ],
})
export class AppModule {}
