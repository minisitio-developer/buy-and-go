import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from '@eventos-ai/auth';
import { EventBusModule } from '@eventos-ai/messaging';
import { EventStoreModule } from '@eventos-ai/event-store';
import { OutboxModule } from '@eventos-ai/outbox';
import { DatabaseModule } from './infra/database/database.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EmailModule } from './modules/email/email.module';
import { SmsModule } from './modules/sms/sms.module';
import { PushModule } from './modules/push/push.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { PreferencesModule } from './modules/preferences/preferences.module';
import { HealthModule } from './modules/health/health.module';
import { ConsumersModule } from './infra/consumers/consumers.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 200 }]),
        AuthModule.forRoot(),
        EventBusModule.forRoot(),
        EventStoreModule.forRoot(),
        OutboxModule.forRoot(),
        DatabaseModule,
        NotificationsModule,
        EmailModule,
        SmsModule,
        PushModule,
        WhatsappModule,
        TemplatesModule,
        PreferencesModule,
        HealthModule,
        ConsumersModule,
    ],
})
export class AppModule {}
