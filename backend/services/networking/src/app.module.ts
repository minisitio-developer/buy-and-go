import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@eventos-ai/cache';
import { AuthModule } from '@eventos-ai/auth';
import { EventBusModule } from '@eventos-ai/messaging';
import { DatabaseModule } from './infra/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { MatchingModule } from './modules/matching/matching.module';
import { ConnectionsModule } from './modules/connections/connections.module';
import { ProximityModule } from './modules/proximity/proximity.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { AiNetworkingModule } from './modules/ai-networking/ai-networking.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        CacheModule.forRoot(),
        AuthModule.forRoot(),
        EventBusModule.forRoot(),
        DatabaseModule,
        HealthModule,
        ProfilesModule,
        MatchingModule,
        ConnectionsModule,
        ProximityModule,
        RecommendationsModule,
        AiNetworkingModule,
    ],
})
export class AppModule {}
