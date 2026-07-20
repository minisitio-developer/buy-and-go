import { Injectable, Logger } from '@nestjs/common';
import { EventBusService, TOPICS, DomainEvent } from '@eventos-ai/messaging';
import { PrismaService } from '../database/prisma.service';
import { GenerationService } from '../../modules/generation/generation.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class DocumentConsumer {
    private readonly logger = new Logger(DocumentConsumer.name);

    constructor(
        private readonly eventBus: EventBusService,
        private readonly prisma: PrismaService,
        private readonly generation: GenerationService,
    ) {}

    async onModuleInit(): Promise<void> {
        await this.eventBus.subscribe(
            TOPICS.CHECKIN.CHECKIN_CREATED,
            'document-certificate-auto',
            this.handleCheckinCreated.bind(this),
        );

        await this.eventBus.subscribe(
            'document.generate',
            'document-generate',
            this.handleGenerateRequest.bind(this),
        );

        this.logger.log('Document consumers initialized');
    }

    private async handleCheckinCreated(event: DomainEvent): Promise<void> {
        const { attendeeId, eventId, attendeeName } = event.payload;

        this.logger.log(`Checkin created: ${attendeeId} for event ${eventId}`);

        try {
            const template = await this.prisma.documentTemplate.findFirst({
                where: { organizationId: event.payload.organizationId, type: 'certificate' },
            });

            if (!template) {
                this.logger.warn(`No certificate template found for event ${eventId}`);
                return;
            }

            const document = await this.prisma.document.create({
                data: {
                    organizationId: event.payload.organizationId,
                    eventId,
                    participantId: attendeeId,
                    type: 'certificate',
                    name: `Certificado - ${attendeeName}`,
                    format: 'pdf',
                    templateId: template.id,
                    metadata: { attendeeName, eventId, generatedBy: 'auto' },
                },
            });

            this.logger.log(`Auto-generated certificate document ${document.id} for ${attendeeName}`);

            await this.generation.generate(document.id);
        } catch (error) {
            this.logger.error(`Error auto-generating certificate for ${attendeeId}`, error);
        }
    }

    private async handleGenerateRequest(event: DomainEvent): Promise<void> {
        const { documentId } = event.payload;
        if (!documentId) {
            this.logger.warn('Generate request missing documentId');
            return;
        }

        this.logger.log(`Generation request for document ${documentId}`);
        await this.generation.generate(documentId);
    }
}
