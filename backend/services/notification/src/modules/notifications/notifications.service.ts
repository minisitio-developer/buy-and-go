import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';
import { PushService } from '../push/push.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { TemplatesService } from '../templates/templates.service';
import { EventBusService, TOPICS } from '@eventos-ai/messaging';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService,
        private readonly smsService: SmsService,
        private readonly pushService: PushService,
        private readonly whatsappService: WhatsappService,
        private readonly templatesService: TemplatesService,
        private readonly eventBus: EventBusService,
    ) {}

    async send(data: {
        organizationId: string;
        eventId?: string;
        participantId?: string;
        type: 'email' | 'sms' | 'push' | 'whatsapp';
        to: string;
        subject?: string;
        body?: string;
        templateId?: string;
        templateData?: Record<string, any>;
    }) {
        let subject = data.subject;
        let body = data.body;

        if (data.templateId) {
            const template = await this.templatesService.findById(data.templateId);
            const rendered = await this.templatesService.render(template, data.templateData || {});
            subject = rendered.subject || subject;
            body = rendered.body;
        }

        if (!body) {
            throw new BadRequestException('Body or templateId is required');
        }

        const notification = await this.prisma.notification.create({
            data: {
                organizationId: data.organizationId,
                eventId: data.eventId,
                participantId: data.participantId,
                type: data.type,
                channel: data.type,
                to: data.to,
                subject,
                body,
                status: 'pending',
            },
        });

        try {
            let providerMessageId: string | null = null;

            switch (data.type) {
                case 'email':
                    providerMessageId = await this.emailService.send({
                        to: data.to,
                        subject: subject || '',
                        body: body || '',
                    });
                    break;
                case 'sms':
                    providerMessageId = await this.smsService.send({
                        to: data.to,
                        body: body || '',
                    });
                    break;
                case 'push':
                    providerMessageId = await this.pushService.send({
                        token: data.to,
                        title: subject || '',
                        body: body || '',
                    });
                    break;
                case 'whatsapp':
                    providerMessageId = await this.whatsappService.send({
                        to: data.to,
                        body: body || '',
                    });
                    break;
            }

            await this.prisma.notification.update({
                where: { id: notification.id },
                data: { status: 'sent', providerMessageId, sentAt: new Date() },
            });

            this.eventBus.publish(
                TOPICS.NOTIFICATION.NOTIFICATION_SENT,
                TOPICS.NOTIFICATION.NOTIFICATION_SENT,
                {
                    notificationId: notification.id,
                    type: data.type,
                    to: data.to,
                    status: 'sent',
                    organizationId: data.organizationId,
                    eventId: data.eventId,
                    participantId: data.participantId,
                },
            ).catch(err => this.logger.error('Failed to publish sent event', err));

            return { id: notification.id, status: 'sent', providerMessageId };
        } catch (error: any) {
            this.logger.error(`Failed to send ${data.type} notification to ${data.to}`, error);

            await this.prisma.notification.update({
                where: { id: notification.id },
                data: { status: 'failed', error: error.message },
            });

            throw error;
        }
    }

    async findAll(params: {
        organizationId: string;
        eventId?: string;
        participantId?: string;
        status?: string;
        type?: string;
        page?: number;
        perPage?: number;
    }) {
        const { organizationId, eventId, participantId, status, type, page = 1, perPage = 20 } = params;
        const where: any = { organizationId };
        if (eventId) where.eventId = eventId;
        if (participantId) where.participantId = participantId;
        if (status) where.status = status;
        if (type) where.type = type;

        const [data, total] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async findById(id: string) {
        const notification = await this.prisma.notification.findUnique({ where: { id } });
        if (!notification) throw new NotFoundException('Notification not found');
        return notification;
    }

    async update(id: string, data: { status?: string; providerMessageId?: string; error?: string; sentAt?: Date }) {
        await this.findById(id);
        return this.prisma.notification.update({ where: { id }, data });
    }

    async resend(id: string) {
        const notification = await this.findById(id);
        return this.send({
            organizationId: notification.organizationId,
            eventId: notification.eventId || undefined,
            participantId: notification.participantId || undefined,
            type: notification.type as any,
            to: notification.to,
            subject: notification.subject || undefined,
            body: notification.body || undefined,
        });
    }
}
