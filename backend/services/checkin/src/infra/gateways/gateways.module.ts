import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CheckinGateway } from './checkin.gateway';
import { NotificationGateway } from './notification.gateway';
import { ChatGateway } from './chat.gateway';

@Global()
@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'eventos-ai-secret-key',
            signOptions: { expiresIn: '1d' },
        }),
    ],
    providers: [CheckinGateway, NotificationGateway, ChatGateway],
    exports: [CheckinGateway, NotificationGateway, ChatGateway],
})
export class GatewaysModule {}
