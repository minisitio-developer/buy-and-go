import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import * as Handlebars from 'handlebars';

@Injectable()
export class TemplatesService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: {
        organizationId: string;
        name: string;
        type: 'email' | 'sms' | 'push' | 'whatsapp';
        subject?: string;
        body: string;
        variables?: string[];
    }) {
        const existing = await this.prisma.notificationTemplate.findUnique({
            where: { organizationId_name: { organizationId: data.organizationId, name: data.name } },
        });
        if (existing) throw new ConflictException('Template name already exists for this organization');

        return this.prisma.notificationTemplate.create({
            data: {
                organizationId: data.organizationId,
                name: data.name,
                type: data.type,
                subject: data.subject,
                body: data.body,
                variables: data.variables || [],
            },
        });
    }

    async findAll(params: {
        organizationId: string;
        type?: string;
        page?: number;
        perPage?: number;
    }) {
        const { organizationId, type, page = 1, perPage = 20 } = params;
        const where: any = { organizationId };
        if (type) where.type = type;

        const [data, total] = await Promise.all([
            this.prisma.notificationTemplate.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notificationTemplate.count({ where }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async findById(id: string) {
        const template = await this.prisma.notificationTemplate.findUnique({ where: { id } });
        if (!template) throw new NotFoundException('Template not found');
        return template;
    }

    async update(id: string, data: { name?: string; type?: string; subject?: string; body?: string; variables?: string[] }) {
        await this.findById(id);
        return this.prisma.notificationTemplate.update({ where: { id }, data });
    }

    async remove(id: string) {
        await this.findById(id);
        return this.prisma.notificationTemplate.delete({ where: { id } });
    }

    async render(template: { subject?: string; body: string; variables: any }, data: Record<string, any>) {
        const subjectTemplate = template.subject ? Handlebars.compile(template.subject) : null;
        const bodyTemplate = Handlebars.compile(template.body);

        return {
            subject: subjectTemplate ? subjectTemplate(data) : undefined,
            body: bodyTemplate(data),
        };
    }
}
