import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter: nodemailer.Transporter;

    constructor() {
        this.initialize();
    }

    private initialize() {
        if (process.env.SENDGRID_API_KEY) {
            this.transporter = nodemailer.createTransport({
                host: 'smtp.sendgrid.net',
                port: 587,
                secure: false,
                auth: {
                    user: 'apikey',
                    pass: process.env.SENDGRID_API_KEY,
                },
            });
            this.logger.log('Email service initialized with SendGrid');
        } else if (process.env.SMTP_HOST) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587', 10),
                secure: process.env.SMTP_PORT === '465',
                auth: {
                    user: process.env.SMTP_USER || '',
                    pass: process.env.SMTP_PASS || '',
                },
            });
            this.logger.log(`Email service initialized with SMTP: ${process.env.SMTP_HOST}`);
        } else {
            this.transporter = nodemailer.createTransport({
                host: 'localhost',
                port: 1025,
                secure: false,
            });
            this.logger.warn('Email service initialized with dummy transport (MailHog)');
        }
    }

    async send(data: { to: string; subject: string; body: string; html?: string }): Promise<string> {
        const fromName = process.env.EMAIL_FROM_NAME || 'Eventos AI';
        const fromAddr = process.env.EMAIL_FROM || 'noreply@eventos.ai';

        const info = await this.transporter.sendMail({
            from: `"${fromName}" <${fromAddr}>`,
            to: data.to,
            subject: data.subject,
            text: data.body,
            html: data.html || data.body.replace(/\n/g, '<br/>'),
        });

        this.logger.log(`Email sent to ${data.to}: ${info.messageId}`);
        return info.messageId || '';
    }
}
