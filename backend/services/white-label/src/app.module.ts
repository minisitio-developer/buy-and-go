import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@eventos-ai/auth';
import { EventBusModule } from '@eventos-ai/messaging';
import { DatabaseModule } from './infra/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { InstancesModule } from './modules/instances/instances.module';
import { BuildsModule } from './modules/builds/builds.module';
import { PublishingModule } from './modules/publishing/publishing.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule.forRoot(),
        EventBusModule.forRoot(),
        DatabaseModule,
        HealthModule,
        TemplatesModule,
        InstancesModule,
        BuildsModule,
        PublishingModule,
    ],
})
export class AppModule {}
