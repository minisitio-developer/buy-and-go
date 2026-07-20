import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { DatabaseModule } from './infra/database/database.module';
import { HealthModule } from './modules/health/health.module';

@Module({
    imports: [
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
        DatabaseModule,
        AuthModule,
        UsersModule,
        OrganizationsModule,
        HealthModule,
    ],
})
export class AppModule {}
