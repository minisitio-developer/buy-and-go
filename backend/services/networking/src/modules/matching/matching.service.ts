import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../infra/database/prisma.service';

interface MatchScore {
    participantId1: string;
    participantId2: string;
    score: number;
    matchedBy: string;
    details: {
        interestScore: number;
        expertiseScore: number;
        goalScore: number;
        proximityScore: number;
    };
}

@Injectable()
export class MatchingService {
    private readonly logger = new Logger(MatchingService.name);

    private readonly WEIGHTS = {
        interests: 0.35,
        expertise: 0.25,
        goals: 0.25,
        proximity: 0.15,
    };

    constructor(private readonly prisma: PrismaService) {}

    @Cron('*/30 * * * *')
    async scheduledMatching() {
        this.logger.log('Running scheduled matching...');
        const events = await this.prisma.participantProfile.findMany({
            select: { eventId: true },
            distinct: ['eventId'],
        });
        for (const evt of events) {
            await this.computeMatches(evt.eventId).catch(e =>
                this.logger.error(`Scheduled matching failed for event ${evt.eventId}`, e),
            );
        }
    }

    async computeMatches(eventId: string, participantId?: string) {
        const profiles = await this.prisma.participantProfile.findMany({
            where: participantId
                ? { eventId, participantId }
                : { eventId },
        });

        if (profiles.length < 2) return { matches: [], reason: 'Need at least 2 profiles' };

        const targetProfiles = participantId
            ? profiles
            : await this.prisma.participantProfile.findMany({ where: { eventId } });

        if (participantId) {
            const allOthers = targetProfiles.filter(p => p.participantId !== participantId);
            const scores = await this.computeScores(profiles[0], allOthers, eventId);
            return this.persistMatches(eventId, scores);
        }

        const processed = new Set<string>();
        const allScores: MatchScore[] = [];

        for (let i = 0; i < targetProfiles.length; i++) {
            for (let j = i + 1; j < targetProfiles.length; j++) {
                const key = [targetProfiles[i].participantId, targetProfiles[j].participantId].sort().join(':');
                if (processed.has(key)) continue;
                processed.add(key);

                const scores = await this.computeScores(targetProfiles[i], [targetProfiles[j]], eventId);
                allScores.push(...scores);
            }
        }

        return this.persistMatches(eventId, allScores);
    }

    private async computeScores(
        profile: any,
        others: any[],
        eventId: string,
    ): Promise<MatchScore[]> {
        const scores: MatchScore[] = [];

        const myInterests: string[] = profile.interests || [];
        const myExpertise: string[] = profile.expertise || [];
        const myGoals: string[] = profile.goals || [];
        const myLookingFor: string[] = profile.lookingFor || [];

        for (const other of others) {
            const theirInterests: string[] = other.interests || [];
            const theirExpertise: string[] = other.expertise || [];
            const theirGoals: string[] = other.goals || [];

            const interestScore = this.jaccardSimilarity(myInterests, theirInterests);

            const expertiseScore = this.computeExpertiseComplementarity(myExpertise, theirExpertise);

            const goalScore = this.jaccardSimilarity(myGoals, theirGoals);

            const lookingForScore = this.computeLookingForAlignment(myLookingFor, theirExpertise, theirInterests);

            const proximityScore = await this.computeProximityScore(
                eventId, profile.participantId, other.participantId,
            );

            const combined =
                this.WEIGHTS.interests * interestScore +
                this.WEIGHTS.expertise * Math.max(expertiseScore, lookingForScore) +
                this.WEIGHTS.goals * goalScore +
                this.WEIGHTS.proximity * proximityScore;

            if (combined > 0.1) {
                scores.push({
                    participantId1: profile.participantId,
                    participantId2: other.participantId,
                    score: Math.round(combined * 100) / 100,
                    matchedBy: combined >= 0.7 ? 'interests' : 'ai',
                    details: {
                        interestScore,
                        expertiseScore,
                        goalScore,
                        proximityScore,
                    },
                });
            }
        }

        return scores;
    }

    private jaccardSimilarity(a: string[], b: string[]): number {
        if (a.length === 0 && b.length === 0) return 0;
        const setA = new Set(a.map(s => s.toLowerCase().trim()));
        const setB = new Set(b.map(s => s.toLowerCase().trim()));
        const intersection = new Set([...setA].filter(x => setB.has(x)));
        const union = new Set([...setA, ...setB]);
        return union.size === 0 ? 0 : intersection.size / union.size;
    }

    private computeExpertiseComplementarity(myExpertise: string[], theirExpertise: string[]): number {
        if (myExpertise.length === 0 || theirExpertise.length === 0) return 0;
        const overlap = myExpertise.filter(e =>
            theirExpertise.some(t => t.toLowerCase().trim() === e.toLowerCase().trim()),
        ).length;
        const max = Math.max(myExpertise.length, theirExpertise.length);
        return max === 0 ? 0 : overlap / max;
    }

    private computeLookingForAlignment(
        lookingFor: string[],
        theirExpertise: string[],
        theirInterests: string[],
    ): number {
        if (lookingFor.length === 0) return 0;
        const theirSkills = new Set([
            ...theirExpertise.map(s => s.toLowerCase().trim()),
            ...theirInterests.map(s => s.toLowerCase().trim()),
        ]);
        const matches = lookingFor.filter(lf => theirSkills.has(lf.toLowerCase().trim()));
        return matches.length / lookingFor.length;
    }

    private async computeProximityScore(
        eventId: string,
        p1: string,
        p2: string,
    ): Promise<number> {
        const [loc1, loc2] = await Promise.all([
            this.prisma.proximityEvent.findFirst({
                where: { eventId, participantId: p1, departedAt: null },
                orderBy: { detectedAt: 'desc' },
            }),
            this.prisma.proximityEvent.findFirst({
                where: { eventId, participantId: p2, departedAt: null },
                orderBy: { detectedAt: 'desc' },
            }),
        ]);

        if (!loc1 || !loc2) return 0;

        const distance = this.haversine(loc1.latitude, loc1.longitude, loc2.latitude, loc2.longitude);

        if (distance < 0.01) return 1.0;
        if (distance < 0.05) return 0.8;
        if (distance < 0.1) return 0.5;
        if (distance < 0.5) return 0.2;
        return 0;
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

    private async persistMatches(eventId: string, scores: MatchScore[]) {
        scores.sort((a, b) => b.score - a.score);
        const topMatches = scores.slice(0, 50);
        let created = 0;
        let updated = 0;

        for (const m of topMatches) {
            const [p1, p2] = [m.participantId1, m.participantId2].sort();
            await this.prisma.match.upsert({
                where: {
                    eventId_participantId1_participantId2: { eventId, participantId1: p1, participantId2: p2 },
                },
                update: {
                    score: m.score,
                    matchedBy: m.matchedBy,
                    matchedAt: new Date(),
                },
                create: {
                    eventId,
                    participantId1: p1,
                    participantId2: p2,
                    score: m.score,
                    matchedBy: m.matchedBy,
                    status: 'pending',
                    matchedAt: new Date(),
                },
            }).then(result => {
                if (result) created++;
            }).catch(() => {
                updated++;
            });
        }

        return { created, updated, total: topMatches.length };
    }

    async findByEvent(eventId: string, params: {
        participantId?: string; status?: string; minScore?: number; page?: number; perPage?: number;
    }) {
        const { participantId, status, minScore, page = 1, perPage = 20 } = params;
        const where: any = { eventId };
        if (participantId) {
            where.OR = [
                { participantId1: participantId },
                { participantId2: participantId },
            ];
        }
        if (status) where.status = status;
        if (minScore !== undefined) where.score = { gte: minScore };

        const [data, total] = await Promise.all([
            this.prisma.match.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { score: 'desc' },
                include: {
                    participant1: { select: { participantId: true, industry: true, role: true, company: true } },
                    participant2: { select: { participantId: true, industry: true, role: true, company: true } },
                },
            }),
            this.prisma.match.count({ where }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async findById(id: string) {
        const match = await this.prisma.match.findUnique({
            where: { id },
            include: {
                participant1: true,
                participant2: true,
            },
        });
        if (!match) throw new NotFoundException('Match not found');
        return match;
    }

    async createManualMatch(eventId: string, participantId1: string, participantId2: string, score?: number) {
        const [p1, p2] = [participantId1, participantId2].sort();
        return this.prisma.match.upsert({
            where: {
                eventId_participantId1_participantId2: { eventId, participantId1: p1, participantId2: p2 },
            },
            update: { matchedBy: 'manual', score: score ?? 1.0, status: 'matched', matchedAt: new Date() },
            create: {
                eventId,
                participantId1: p1,
                participantId2: p2,
                score: score ?? 1.0,
                matchedBy: 'manual',
                status: 'matched',
                matchedAt: new Date(),
            },
        });
    }

    async updateStatus(id: string, status: string) {
        const match = await this.findById(id);
        return this.prisma.match.update({
            where: { id },
            data: {
                status,
                connectedAt: status === 'connected' ? new Date() : undefined,
            },
        });
    }
}
