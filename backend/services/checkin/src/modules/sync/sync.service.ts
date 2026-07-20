import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class SyncService {
    constructor(private readonly prisma: PrismaService) {}

    async getSyncData(eventId: string) {
        const event = await this.prisma.attendee.findFirst({
            where: { eventId },
            select: { eventId: true },
        });
        if (!event) throw new NotFoundException('No data for this event');

        const attendees = await this.prisma.attendee.findMany({
            where: { eventId },
            include: { credential: true },
        });

        const attendeesData = attendees.map(a => ({
            id: a.id,
            name: a.name,
            email: a.email,
            document: a.document,
            category: a.category,
            company: a.company,
            qrCode: a.credential?.qrCode,
            photoUrl: null,
        }));

        return {
            event: { id: eventId },
            attendees: attendeesData,
            syncToken: crypto.randomUUID(),
            syncedAt: new Date().toISOString(),
        };
    }

    async syncCheckIns(data: {
        syncToken: string;
        checkIns: Array<{
            attendeeId: string;
            eventId: string;
            method: string;
            checkedInAt: string;
            deviceId: string;
        }>;
    }) {
        const results = { synced: 0, skipped: 0, errors: [] as string[] };

        for (const ci of data.checkIns) {
            try {
                const existing = await this.prisma.checkIn.findUnique({
                    where: {
                        attendeeId_eventId: {
                            attendeeId: ci.attendeeId,
                            eventId: ci.eventId,
                        },
                    },
                });

                if (existing) {
                    results.skipped++;
                    continue;
                }

                await this.prisma.checkIn.create({
                    data: {
                        attendeeId: ci.attendeeId,
                        eventId: ci.eventId,
                        method: ci.method,
                        deviceId: ci.deviceId,
                        createdAt: new Date(ci.checkedInAt),
                        isSynced: false,
                    },
                });

                results.synced++;
            } catch (e: any) {
                results.errors.push(`${ci.attendeeId}: ${e.message}`);
            }
        }

        return results;
    }
}
