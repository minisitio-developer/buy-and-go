import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class ProfilesService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: {
        eventId: string;
        participantId: string;
        interests?: string[];
        expertise?: string[];
        goals?: string[];
        lookingFor?: string[];
        industry?: string;
        role?: string;
        company?: string;
        bio?: string;
        photoUrl?: string;
        linkedInUrl?: string;
    }) {
        const existing = await this.prisma.participantProfile.findUnique({
            where: { participantId: data.participantId },
        });
        if (existing) throw new ConflictException('Profile already exists for this participant');

        return this.prisma.participantProfile.create({
            data: {
                participantId: data.participantId,
                eventId: data.eventId,
                interests: data.interests || [],
                expertise: data.expertise || [],
                goals: data.goals || [],
                lookingFor: data.lookingFor || [],
                industry: data.industry,
                role: data.role,
                company: data.company,
                bio: data.bio,
                photoUrl: data.photoUrl,
                linkedInUrl: data.linkedInUrl,
            },
        });
    }

    async findByEvent(eventId: string, params: {
        industry?: string; role?: string; search?: string; page?: number; perPage?: number;
    }) {
        const { industry, role, search, page = 1, perPage = 20 } = params;
        const where: any = { eventId };
        if (industry) where.industry = { contains: industry, mode: 'insensitive' };
        if (role) where.role = { contains: role, mode: 'insensitive' };
        if (search) where.OR = [
            { bio: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } },
            { industry: { contains: search, mode: 'insensitive' } },
        ];

        const [data, total] = await Promise.all([
            this.prisma.participantProfile.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { updatedAt: 'desc' },
            }),
            this.prisma.participantProfile.count({ where }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async findById(participantId: string) {
        const profile = await this.prisma.participantProfile.findUnique({
            where: { participantId },
            include: {
                matchesAs1: { take: 10, orderBy: { score: 'desc' } },
                matchesAs2: { take: 10, orderBy: { score: 'desc' } },
                connectionsAs1: { take: 10 },
                connectionsAs2: { take: 10 },
            },
        });
        if (!profile) throw new NotFoundException('Participant profile not found');
        return profile;
    }

    async update(participantId: string, data: Partial<{
        interests: string[];
        expertise: string[];
        goals: string[];
        lookingFor: string[];
        industry: string;
        role: string;
        company: string;
        bio: string;
        photoUrl: string;
        linkedInUrl: string;
    }>) {
        await this.findById(participantId);
        return this.prisma.participantProfile.update({ where: { participantId }, data });
    }

    async remove(participantId: string) {
        await this.findById(participantId);
        await this.prisma.match.deleteMany({
            where: { OR: [{ participantId1: participantId }, { participantId2: participantId }] },
        });
        await this.prisma.connection.deleteMany({
            where: { OR: [{ participantId1: participantId }, { participantId2: participantId }] },
        });
        await this.prisma.proximityEvent.deleteMany({ where: { participantId } });
        await this.prisma.recommendation.deleteMany({ where: { participantId } });
        return this.prisma.participantProfile.delete({ where: { participantId } });
    }
}
