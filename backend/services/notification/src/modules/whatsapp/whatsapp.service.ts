import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WhatsappService {
    private readonly logger = new Logger(WhatsappService.name);
    private twilioClient: any;

    constructor() {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;

        if (accountSid && authToken) {
            try {
                const twilio = require('twilio');
                this.twilioClient = twilio(accountSid, authToken);
                this.logger.log('WhatsApp service initialized with Twilio');
            } catch {
                this.logger.warn('Twilio client initialization failed, using console logger');
            }
        } else {
            this.logger.warn('Twilio credentials not found, WhatsApp will be logged only');
        }
    }

    async send(data: { to: string; body: string }): Promise<string> {
        const from = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
        const to = data.to.startsWith('whatsapp:') ? data.to : `whatsapp:${data.to}`;

        if (this.twilioClient) {
            const message = await this.twilioClient.messages.create({
                body: data.body,
                from: `whatsapp:${from.replace('whatsapp:', '')}`,
                to,
            });
            this.logger.log(`WhatsApp sent to ${data.to}: ${message.sid}`);
            return message.sid;
        }

        this.logger.log(`[WhatsApp Mock] To: ${data.to} Body: ${data.body}`);
        return `mock-${Date.now()}`;
    }
}
