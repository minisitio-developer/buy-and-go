import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { AiClient } from '../../infra/clients/ai.client';

@Injectable()
export class FaceService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly ai: AiClient,
    ) {}

    async enrollFace(attendeeId: string, image: Buffer) {
        const attendee = await this.prisma.attendee.findUnique({ where: { id: attendeeId } });
        if (!attendee) {
            throw new NotFoundException('Attendee not found');
        }

        const existing = await this.prisma.faceTemplate.findFirst({
            where: { attendeeId },
        });
        if (existing) {
            throw new ConflictException('Attendee already has an enrolled face. Delete the existing one first.');
        }

        const result = await this.ai.enrollFace(attendeeId, image);
        if (!result.success) {
            throw new BadRequestException(result.error || 'Face enrollment failed');
        }

        const template = await this.prisma.faceTemplate.create({
            data: {
                attendeeId,
                templateId: result.template_id!,
                algorithm: result.algorithm || 'Facenet',
                qualityScore: result.quality_score,
            },
        });

        return template;
    }

    async getTemplates(attendeeId: string) {
        const attendee = await this.prisma.attendee.findUnique({ where: { id: attendeeId } });
        if (!attendee) {
            throw new NotFoundException('Attendee not found');
        }

        const templates = await this.prisma.faceTemplate.findMany({
            where: { attendeeId },
            orderBy: { createdAt: 'desc' },
        });

        return { templates };
    }

    async deleteTemplate(attendeeId: string, templateId: string) {
        const template = await this.prisma.faceTemplate.findFirst({
            where: { id: templateId, attendeeId },
        });
        if (!template) {
            throw new NotFoundException('Face template not found');
        }

        await this.prisma.faceTemplate.delete({ where: { id: templateId } });
        return { deleted: true };
    }

    async verifyAndCheckin(
        attendeeId: string,
        eventId: string,
        image: Buffer,
        options: { threshold?: number; deviceInfo?: Record<string, any>; checkedInBy?: string; location?: any } = {},
    ) {
        const attendee = await this.prisma.attendee.findUnique({ where: { id: attendeeId } });
        if (!attendee) {
            throw new NotFoundException('Attendee not found');
        }

        const existingCheckin = await this.prisma.checkIn.findUnique({
            where: { attendeeId_eventId: { attendeeId, eventId } },
        });
        if (existingCheckin) {
            throw new ConflictException({
                status: 'already_checked_in',
                attendee: { name: attendee.name, category: attendee.category },
                checkedInAt: existingCheckin.createdAt,
            });
        }

        const liveness = await this.ai.livenessCheck(image);
        if (!liveness.live) {
            throw new BadRequestException({
                status: 'liveness_failed',
                message: 'Liveness check failed. Please try again or use an alternative method (QR code, manual).',
                confidence: liveness.confidence,
            });
        }

        const verify = await this.ai.verifyFace(attendeeId, image, options.threshold ?? 0.4);
        if (!verify.verified) {
            throw new BadRequestException({
                status: 'verification_failed',
                message: 'Face verification did not match. Please try again or use an alternative method (QR code, manual).',
                score: verify.score,
            });
        }

        const checkin = await this.prisma.checkIn.create({
            data: {
                attendeeId,
                eventId,
                method: 'facial',
                checkedInBy: options.checkedInBy,
                location: options.location || undefined,
                metadata: { face_score: verify.score, liveness_score: liveness.confidence },
            },
            include: { attendee: { select: { name: true, category: true, company: true } } },
        });

        await this.prisma.faceVerification.create({
            data: {
                checkinId: checkin.id,
                attendeeId,
                score: verify.score,
                verified: true,
                livenessScore: liveness.confidence,
                deviceInfo: options.deviceInfo || undefined,
            },
        });

        return {
            status: 'approved',
            attendee: checkin.attendee,
            checkedInAt: checkin.createdAt,
            faceScore: verify.score,
            livenessScore: liveness.confidence,
        };
    }
}
