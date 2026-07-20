import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { EventBusService } from '@eventos-ai/messaging';
import { v4 as uuid } from 'uuid';
import { DateTime } from 'luxon';

@Injectable()
export class SignaturesService {
    private readonly logger = new Logger(SignaturesService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly eventBus: EventBusService,
    ) {}

    async create(data: {
        documentId: string;
        signerEmail: string;
        signerName: string;
    }) {
        const document = await this.prisma.document.findUnique({ where: { id: data.documentId } });
        if (!document) throw new NotFoundException('Document not found');

        const signature = await this.prisma.signatureRequest.create({
            data: {
                documentId: data.documentId,
                signerEmail: data.signerEmail,
                signerName: data.signerName,
            },
        });

        this.eventBus.publish(
            'signature.requested',
            'signature.requested',
            {
                signatureId: signature.id,
                documentId: data.documentId,
                signerEmail: data.signerEmail,
                signerName: data.signerName,
            },
        ).catch(err => this.logger.error('Failed to publish signature event', err));

        return signature;
    }

    async findByDocument(documentId: string) {
        return this.prisma.signatureRequest.findMany({
            where: { documentId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async sign(id: string, data: { certificateInfo?: Record<string, any> }) {
        const signature = await this.prisma.signatureRequest.findUnique({ where: { id } });
        if (!signature) throw new NotFoundException('Signature request not found');

        const updated = await this.prisma.signatureRequest.update({
            where: { id },
            data: {
                status: 'signed',
                signedAt: new Date(),
                certificateInfo: data.certificateInfo || undefined,
            },
        });

        this.eventBus.publish(
            'signature.completed',
            'signature.completed',
            {
                signatureId: id,
                documentId: signature.documentId,
                signerEmail: signature.signerEmail,
                signedAt: updated.signedAt?.toISOString(),
            },
        ).catch(err => this.logger.error('Failed to publish signature.completed event', err));

        return updated;
    }

    async decline(id: string) {
        const signature = await this.prisma.signatureRequest.findUnique({ where: { id } });
        if (!signature) throw new NotFoundException('Signature request not found');

        const updated = await this.prisma.signatureRequest.update({
            where: { id },
            data: { status: 'declined' },
        });

        this.eventBus.publish(
            'signature.declined',
            'signature.declined',
            {
                signatureId: id,
                documentId: signature.documentId,
                signerEmail: signature.signerEmail,
            },
        ).catch(err => this.logger.error('Failed to publish signature.declined event', err));

        return updated;
    }
}
