import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { EventBusService, TOPICS } from '@eventos-ai/messaging';

@Injectable()
export class ProximityService {
    private readonly logger = new Logger(ProximityService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly eventBus: EventBusService,
    ) {}

    async recordLocation(
        eventId: string,
        participantId: string,
        data: { latitude: number; longitude: number; accuracy?: number },
    ) {
        const active = await this.prisma.proximityEvent.findFirst({
            where: { eventId, participantId, departedAt: null },
            orderBy: { detectedAt: 'desc' },
        });

        if (active) {
            const distance = this.haversine(
                active.latitude, active.longitude,
                data.latitude, data.longitude,
            );
            if (distance < 0.001) return active;
        }

        if (active) {
            await this.prisma.proximityEvent.update({
                where: { id: active.id },
                data: { departedAt: new Date() },
            });
        }

        const proximityEvent = await this.prisma.proximityEvent.create({
            data: {
                eventId,
                participantId,
                latitude: data.latitude,
                longitude: data.longitude,
                accuracy: data.accuracy,
            },
        });

        this.detectNearby(eventId, participantId, data.latitude, data.longitude);

        return proximityEvent;
    }

    async markDeparted(eventId: string, participantId: string) {
        const active = await this.prisma.proximityEvent.findFirst({
            where: { eventId, participantId, departedAt: null },
            orderBy: { detectedAt: 'desc' },
        });
        if (!active) return { message: 'No active location' };

        await this.prisma.proximityEvent.update({
            where: { id: active.id },
            data: { departedAt: new Date() },
        });
        return { departed: true };
    }

    async findNearby(eventId: string, participantId: string, radiusKm = 0.05) {
        const current = await this.prisma.proximityEvent.findFirst({
            where: { eventId, participantId, departedAt: null },
            orderBy: { detectedAt: 'desc' },
        });
        if (!current) return { nearby: [] };

        const activeLocations = await this.prisma.proximityEvent.findMany({
            where: {
                eventId,
                participantId: { not: participantId },
                departedAt: null,
            },
            include: {
                participant: {
                    select: {
                        participantId: true, industry: true, role: true, company: true,
                        bio: true, interests: true,
                    },
                },
            },
        });

        const nearby = activeLocations
            .map(loc => {
                const distance = this.haversine(
                    current.latitude, current.longitude,
                    loc.latitude, loc.longitude,
                );
                return { ...loc, distanceKm: Math.round(distance * 1000) / 1000 };
            })
            .filter(loc => loc.distanceKm <= radiusKm)
            .sort((a, b) => a.distanceKm - b.distanceKm);

        return { nearby, count: nearby.length, radiusKm };
    }

    private async detectNearby(
        eventId: string,
        participantId: string,
        latitude: number,
        longitude: number,
    ) {
        const nearby = await this.findNearby(eventId, participantId, 0.01);
        if (nearby.nearby.length === 0) return;

        const profile = await this.prisma.participantProfile.findUnique({
            where: { participantId },
        });

        for (const loc of nearby.nearby) {
            this.eventBus.publish(
                TOPICS.NETWORKING.PROXIMITY_ALERT,
                'networking-proximity-alert',
                {
                    eventId,
                    participantId,
                    participantName: profile?.company || participantId,
                    nearbyParticipantId: loc.participantId,
                    nearbyParticipantName: loc.participant.company || loc.participantId,
                    distanceKm: loc.distanceKm,
                    timestamp: new Date().toISOString(),
                },
            ).catch(err => this.logger.error('Failed to publish proximity alert', err));
        }

        this.logger.log(`Detected ${nearby.count} nearby participants for ${participantId}`);
    }

    async getHistory(eventId: string, participantId: string, params: { page?: number; perPage?: number }) {
        const { page = 1, perPage = 20 } = params;

        const [data, total] = await Promise.all([
            this.prisma.proximityEvent.findMany({
                where: { eventId, participantId },
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { detectedAt: 'desc' },
            }),
            this.prisma.proximityEvent.count({ where: { eventId, participantId } }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async getHeatmap(eventId: string, since?: Date) {
        const where: any = { eventId };
        if (since) where.detectedAt = { gte: since };

        const locations = await this.prisma.proximityEvent.findMany({
            where,
            select: {
                latitude: true,
                longitude: true,
                accuracy: true,
                detectedAt: true,
            },
            orderBy: { detectedAt: 'asc' },
        });

        return { locations, count: locations.length };
    }

    private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371;
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRad(deg: number): number {
        return (deg * Math.PI) / 180;
    }
}
