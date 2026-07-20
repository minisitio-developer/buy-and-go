import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from '@eventos-ai/auth';
import { DatabaseModule } from './infra/database/database.module';
import { SponsorsModule } from './modules/sponsors/sponsors.module';
import { BoothsModule } from './modules/booths/booths.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { HealthModule } from './modules/health/health.module';

@Module({
    imports: [
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 200 }]),
        AuthModule.forRoot(),
        DatabaseModule, SponsorsModule, BoothsModule, MetricsModule,
        HealthModule,
    ],
})
export class AppModule {}
