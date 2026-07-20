import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class PreferencesService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: {
        organizationId: string;
        participantId: string;
        channel: 'email' | 'sms' | 'push' | 'whatsapp';
        enabled?: boolean;
    }) {
        return this.prisma.notificationPreference.upsert({
            where: {
                participantId_channel: {
                    participantId: data.participantId,
                    channel: data.channel,
                },
            },
            update: { enabled: data.enabled ?? true },
            create: {
                organizationId: data.organizationId,
                participantId: data.participantId,
                channel: data.channel,
                enabled: data.enabled ?? true,
            },
        });
    }

    async findAll(params: { organizationId: string; page?: number; perPage?: number }) {
        const { organizationId, page = 1, perPage = 20 } = params;
        const where = { organizationId };

        const [data, total] = await Promise.all([
            this.prisma.notificationPreference.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notificationPreference.count({ where }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async findById(id: string) {
        const pref = await this.prisma.notificationPreference.findUnique({ where: { id } });
        if (!pref) throw new NotFoundException('Preference not found');
        return pref;
    }

    async findByParticipant(organizationId: string, participantId: string) {
        return this.prisma.notificationPreference.findMany({
            where: { organizationId, participantId },
        });
    }

    async update(id: string, data: { enabled?: boolean; channel?: string }) {
        await this.findById(id);
        return this.prisma.notificationPreference.update({ where: { id }, data });
    }
}
