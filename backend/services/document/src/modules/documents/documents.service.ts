import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { StorageService } from '../../infra/storage/storage.service';
import { GenerationService } from '../generation/generation.service';
import { EventBusService } from '@eventos-ai/messaging';
import { v4 as uuid } from 'uuid';

@Injectable()
export class DocumentsService {
    private readonly logger = new Logger(DocumentsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly storage: StorageService,
        private readonly generation: GenerationService,
        private readonly eventBus: EventBusService,
    ) {}

    async create(data: {
        organizationId: string;
        eventId?: string;
        participantId?: string;
        type: string;
        name: string;
        format?: string;
        templateId?: string;
        metadata?: Record<string, any>;
    }) {
        const document = await this.prisma.document.create({
            data: {
                organizationId: data.organizationId,
                eventId: data.eventId,
                participantId: data.participantId,
                type: data.type as any,
                name: data.name,
                format: (data.format || 'pdf') as any,
                templateId: data.templateId,
                metadata: data.metadata || {},
            },
        });

        return document;
    }

    async findAll(organizationId: string, params: {
        eventId?: string; type?: string; status?: string; page?: number; perPage?: number;
    }) {
        const { eventId, type, status, page = 1, perPage = 20 } = params;
        const where: any = { organizationId };

        if (eventId) where.eventId = eventId;
        if (type) where.type = type;
        if (status) where.status = status;

        const [data, total] = await Promise.all([
            this.prisma.document.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { createdAt: 'desc' },
                include: { template: { select: { name: true } }, signatures: { select: { id: true, signerEmail: true, status: true } } },
            }),
            this.prisma.document.count({ where }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async findOne(id: string) {
        const document = await this.prisma.document.findUnique({
            where: { id },
            include: {
                template: true,
                signatures: true,
            },
        });

        if (!document) throw new NotFoundException('Document not found');
        return document;
    }

    async generate(id: string) {
        const document = await this.prisma.document.findUnique({ where: { id } });
        if (!document) throw new NotFoundException('Document not found');

        await this.generation.generate(id);

        return { status: 'queued', documentId: id };
    }

    async download(id: string): Promise<{ data: Buffer; mimeType: string; filename: string }> {
        const document = await this.findOne(id);

        if (!document.storageUrl) {
            throw new NotFoundException('Document has not been generated yet');
        }

        const data = await this.storage.get(document.storageUrl);
        if (!data) {
            throw new NotFoundException('Document file not found in storage');
        }

        const mimeTypes: Record<string, string> = {
            pdf: 'application/pdf',
            png: 'image/png',
            html: 'text/html',
        };

        return {
            data,
            mimeType: mimeTypes[document.format] || 'application/octet-stream',
            filename: `${document.name}.${document.format}`,
        };
    }

    async getStats(eventId: string) {
        const [total, byType, byStatus] = await Promise.all([
            this.prisma.document.count({ where: { eventId } }),
            this.prisma.document.groupBy({
                by: ['type'],
                where: { eventId },
                _count: true,
            }),
            this.prisma.document.groupBy({
                by: ['status'],
                where: { eventId },
                _count: true,
            }),
        ]);

        return {
            total,
            byType: byType.map(t => ({ type: t.type, count: t._count })),
            byStatus: byStatus.map(s => ({ status: s.status, count: s._count })),
        };
    }

    async batchGenerate(data: {
        organizationId: string;
        eventId: string;
        type: string;
        participantIds: string[];
    }) {
        const template = await this.prisma.documentTemplate.findFirst({
            where: { organizationId: data.organizationId, type: data.type as any },
        });

        if (!template) {
            throw new NotFoundException(`No ${data.type} template found for this organization`);
        }

        const results = await Promise.allSettled(
            data.participantIds.map(async (participantId) => {
                const document = await this.prisma.document.create({
                    data: {
                        organizationId: data.organizationId,
                        eventId: data.eventId,
                        participantId,
                        type: data.type as any,
                        name: `Documento - ${participantId}`,
                        format: 'pdf',
                        templateId: template.id,
                        metadata: { participantId, eventId, batchGenerated: true },
                    },
                });

                await this.generation.generate(document.id);
                return document.id;
            }),
        );

        const succeeded = results.filter(r => r.status === 'fulfilled').map(r => (r as PromiseFulfilledResult<string>).value);
        const failed = results.filter(r => r.status === 'rejected');

        return {
            total: data.participantIds.length,
            succeeded: succeeded.length,
            failed: failed.length,
            documentIds: succeeded,
        };
    }
}
