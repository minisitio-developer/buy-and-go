import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
    private readonly logger = new Logger(SmsService.name);
    private twilioClient: any;

    constructor() {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;

        if (accountSid && authToken) {
            try {
                const twilio = require('twilio');
                this.twilioClient = twilio(accountSid, authToken);
                this.logger.log('SMS service initialized with Twilio');
            } catch {
                this.logger.warn('Twilio client initialization failed, using console logger');
            }
        } else {
            this.logger.warn('Twilio credentials not found, SMS will be logged only');
        }
    }

    async send(data: { to: string; body: string }): Promise<string> {
        const from = process.env.TWILIO_SMS_NUMBER;

        if (!from) {
            this.logger.warn(`TWILIO_SMS_NUMBER not set, logging SMS to ${data.to}`);
            this.logger.log(`[SMS] To: ${data.to} Body: ${data.body}`);
            return `log-${Date.now()}`;
        }

        if (this.twilioClient) {
            const message = await this.twilioClient.messages.create({
                body: data.body,
                from,
                to: data.to,
            });
            this.logger.log(`SMS sent to ${data.to}: ${message.sid}`);
            return message.sid;
        }

        this.logger.log(`[SMS Mock] To: ${data.to} Body: ${data.body}`);
        return `mock-${Date.now()}`;
    }
}
