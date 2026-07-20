import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';
import { PushService } from '../push/push.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { TemplatesService } from '../templates/templates.service';

@Module({
    controllers: [NotificationsController],
    providers: [NotificationsService, EmailService, SmsService, PushService, WhatsappService, TemplatesService],
    exports: [NotificationsService],
})
export class NotificationsModule {}
