import {
    Injectable, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { CheckinGateway } from '../../infra/gateways/checkin.gateway';
import { AiClient } from '../../infra/clients/ai.client';
import { EventBusService, TOPICS } from '@eventos-ai/messaging';

@Injectable()
export class CheckInsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly checkinGateway: CheckinGateway,
        private readonly ai: AiClient,
        private readonly eventBus: EventBusService,
    ) {}

    async checkIn(data: {
        eventId: string;
        qrCode?: string;
        document?: string;
        method: string;
        checkedInBy?: string;
        deviceId?: string;
        location?: any;
    }) {
        const attendee = await this.findAttendee(data.eventId, data.qrCode, data.document);
        if (!attendee) throw new NotFoundException('Attendee not found or invalid credential');

        const existing = await this.prisma.checkIn.findUnique({
            where: { attendeeId_eventId: { attendeeId: attendee.id, eventId: data.eventId } },
        });

        if (existing) {
            throw new ConflictException({
                status: 'already_checked_in',
                attendee: { name: attendee.name, category: attendee.category },
                checkedInAt: existing.createdAt,
            });
        }

        const checkIn = await this.prisma.checkIn.create({
            data: {
                attendeeId: attendee.id,
                eventId: data.eventId,
                method: data.method,
                checkedInBy: data.checkedInBy,
                deviceId: data.deviceId,
                location: data.location || undefined,
            },
            include: { attendee: { select: { name: true, category: true, company: true } } },
        });

        this.checkinGateway.emitCheckinUpdate(data.eventId, {
            eventId: data.eventId,
            attendee: checkIn.attendee,
            method: data.method,
            checkedInAt: checkIn.createdAt,
        });

        this.eventBus.publish(
            TOPICS.CHECKIN.CHECKIN_CREATED,
            TOPICS.CHECKIN.CHECKIN_CREATED,
            {
                attendeeId: attendee.id,
                eventId: data.eventId,
                method: data.method,
                checkedInAt: checkIn.createdAt,
                checkedInBy: data.checkedInBy,
                deviceId: data.deviceId,
                location: data.location,
                attendeeName: checkIn.attendee.name,
                attendeeCategory: checkIn.attendee.category,
                attendeeCompany: checkIn.attendee.company,
            },
        ).catch(err => console.error('Failed to publish checkin event', err));

        return {
            status: 'approved',
            attendee: checkIn.attendee,
            checkedInAt: checkIn.createdAt,
        };
    }

    async manualCheckIn(data: {
        eventId: string;
        attendeeId: string;
        checkedInBy?: string;
    }) {
        const attendee = await this.prisma.attendee.findUnique({ where: { id: data.attendeeId } });
        if (!attendee) throw new NotFoundException('Attendee not found');

        return this.checkIn({
            eventId: data.eventId,
            document: attendee.document || undefined,
            method: 'manual',
            checkedInBy: data.checkedInBy,
        });
    }

    async findByEvent(eventId: string, params: {
        method?: string; date?: string; page?: number; perPage?: number;
    }) {
        const { method, date, page = 1, perPage = 20 } = params;
        const where: any = { eventId };
        if (method) where.method = method;
        if (date) {
            const d = new Date(date);
            where.createdAt = { gte: d, lt: new Date(d.getTime() + 86400000) };
        }

        const [data, total] = await Promise.all([
            this.prisma.checkIn.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { createdAt: 'desc' },
                include: { attendee: { select: { name: true, category: true, company: true } } },
            }),
            this.prisma.checkIn.count({ where }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async getStats(eventId: string) {
        const [total, byMethod, byHour] = await Promise.all([
            this.prisma.checkIn.count({ where: { eventId } }),
            this.prisma.checkIn.groupBy({
                by: ['method'],
                where: { eventId },
                _count: true,
            }),
            this.prisma.$queryRaw`
                SELECT EXTRACT(HOUR FROM created_at) as hour, COUNT(*) as count
                FROM check_ins
                WHERE event_id = ${eventId}::uuid
                AND created_at >= NOW() - INTERVAL '24 hours'
                GROUP BY hour ORDER BY hour
            `,
        ]);

        return { total, byMethod: byMethod.map(m => ({ method: m.method, count: m._count })), byHour };
    }

    async checkInByFace(data: {
        attendeeId: string;
        eventId: string;
        image: Buffer;
        threshold?: number;
        deviceInfo?: Record<string, any>;
        checkedInBy?: string;
        location?: any;
    }) {
        const attendee = await this.prisma.attendee.findUnique({ where: { id: data.attendeeId } });
        if (!attendee) throw new NotFoundException('Attendee not found');

        const existing = await this.prisma.checkIn.findUnique({
            where: { attendeeId_eventId: { attendeeId: data.attendeeId, eventId: data.eventId } },
        });
        if (existing) {
            throw new ConflictException({
                status: 'already_checked_in',
                attendee: { name: attendee.name, category: attendee.category },
                checkedInAt: existing.createdAt,
            });
        }

        const liveness = await this.ai.livenessCheck(data.image);
        if (!liveness.live) {
            throw new BadRequestException({
                status: 'liveness_failed',
                message: 'Liveness check failed. Please try again or use QR / manual check-in.',
                confidence: liveness.confidence,
            });
        }

        const verify = await this.ai.verifyFace(data.attendeeId, data.image, data.threshold ?? 0.4);
        if (!verify.verified) {
            throw new BadRequestException({
                status: 'verification_failed',
                message: 'Face does not match enrolled template. Try again or use QR / manual check-in.',
                score: verify.score,
            });
        }

        const checkIn = await this.prisma.checkIn.create({
            data: {
                attendeeId: data.attendeeId,
                eventId: data.eventId,
                method: 'facial',
                checkedInBy: data.checkedInBy,
                location: data.location || undefined,
                metadata: { face_score: verify.score, liveness_score: liveness.confidence },
            },
            include: { attendee: { select: { name: true, category: true, company: true } } },
        });

        await this.prisma.faceVerification.create({
            data: {
                checkinId: checkIn.id,
                attendeeId: data.attendeeId,
                score: verify.score,
                verified: true,
                livenessScore: liveness.confidence,
                deviceInfo: data.deviceInfo || undefined,
            },
        });

        this.checkinGateway.emitCheckinUpdate(data.eventId, {
            eventId: data.eventId,
            attendee: checkIn.attendee,
            method: 'facial',
            checkedInAt: checkIn.createdAt,
        });

        this.eventBus.publish(
            TOPICS.CHECKIN.CHECKIN_CREATED,
            TOPICS.CHECKIN.CHECKIN_CREATED,
            {
                attendeeId: data.attendeeId,
                eventId: data.eventId,
                method: 'facial',
                checkedInAt: checkIn.createdAt,
                checkedInBy: data.checkedInBy,
                deviceId: undefined,
                location: data.location,
                attendeeName: checkIn.attendee.name,
                attendeeCategory: checkIn.attendee.category,
                attendeeCompany: checkIn.attendee.company,
                faceScore: verify.score,
                livenessScore: liveness.confidence,
            },
        ).catch(err => console.error('Failed to publish checkin event', err));

        return {
            status: 'approved',
            attendee: checkIn.attendee,
            checkedInAt: checkIn.createdAt,
            faceScore: verify.score,
            livenessScore: liveness.confidence,
        };
    }

    private async findAttendee(eventId: string, qrCode?: string, document?: string) {
        if (qrCode) {
            const credential = await this.prisma.credential.findUnique({
                where: { qrCode },
                include: { attendee: true },
            });
            return credential?.attendee ?? null;
        }

        if (document) {
            return this.prisma.attendee.findFirst({
                where: { eventId, document },
            });
        }

        return null;
    }
}
