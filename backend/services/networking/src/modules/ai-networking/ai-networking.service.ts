import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infra/database/prisma.service';

export interface ProfileAnalysis {
    tags: string[];
    communicationStyle: string;
    networkingStrength: string[];
    suggestedConnections: string;
    summary: string;
}

export interface SmartMatchResult {
    participantId: string;
    score: number;
    reason: string;
    suggestedIcebreaker: string;
}

export interface IcebreakerResult {
    icebreaker: string;
    topic: string;
    context: string;
}

@Injectable()
export class AiNetworkingService {
    private readonly logger = new Logger(AiNetworkingService.name);

    constructor(
        private readonly http: HttpService,
        private readonly config: ConfigService,
        private readonly prisma: PrismaService,
    ) {}

    private get baseUrl(): string {
        return this.config.get('AI_SERVICE_URL', 'http://localhost:8000');
    }

    async analyzeProfile(eventId: string, participantId: string): Promise<ProfileAnalysis> {
        const profile = await this.prisma.participantProfile.findUnique({
            where: { participantId },
        });
        if (!profile) throw new NotFoundException('Profile not found');

        try {
            const response = await firstValueFrom(
                this.http.post(`${this.baseUrl}/v1/networking/analyze`, {
                    profile: {
                        interests: profile.interests,
                        expertise: profile.expertise,
                        goals: profile.goals,
                        lookingFor: profile.lookingFor,
                        industry: profile.industry,
                        role: profile.role,
                        bio: profile.bio,
                    },
                }),
            );
            await this.prisma.participantProfile.update({
                where: { participantId },
                data: { bio: profile.bio || response.data.summary },
            });
            return response.data;
        } catch {
            return this.fallbackAnalysis(profile);
        }
    }

    private fallbackAnalysis(profile: any): ProfileAnalysis {
        const allTags = [
            ...(profile.interests || []),
            ...(profile.expertise || []),
            ...(profile.goals || []),
        ];
        return {
            tags: [...new Set(allTags.map((t: string) => t.toLowerCase()))].slice(0, 10),
            communicationStyle: profile.role ? `${profile.role} professional` : 'General',
            networkingStrength: [
                ...(profile.expertise?.length ? ['Domain expert'] : []),
                ...(profile.goals?.length ? ['Goal-oriented'] : []),
                ...(profile.interests?.length ? ['Broad interests'] : []),
            ],
            suggestedConnections: `Look for participants interested in ${(profile.interests || []).slice(0, 3).join(', ')}`,
            summary: profile.bio || `A ${profile.role || 'professional'} in ${profile.industry || 'technology'}`,
        };
    }

    async smartMatch(eventId: string, participantId: string, limit = 10): Promise<SmartMatchResult[]> {
        const profile = await this.prisma.participantProfile.findUnique({
            where: { participantId },
        });
        if (!profile) throw new NotFoundException('Profile not found');

        const others = await this.prisma.participantProfile.findMany({
            where: { eventId, participantId: { not: participantId } },
        });

        const existingMatches = await this.prisma.match.findMany({
            where: {
                eventId,
                OR: [
                    { participantId1: participantId },
                    { participantId2: participantId },
                ],
            },
            select: {
                participantId1: true,
                participantId2: true,
                score: true,
            },
        });

        const matchedIds = new Set<string>();
        for (const m of existingMatches) {
            matchedIds.add(m.participantId1 === participantId ? m.participantId2 : m.participantId1);
        }

        try {
            const response = await firstValueFrom(
                this.http.post(`${this.baseUrl}/v1/networking/smart-match`, {
                    profile: {
                        interests: profile.interests,
                        expertise: profile.expertise,
                        goals: profile.goals,
                        lookingFor: profile.lookingFor,
                        industry: profile.industry,
                        role: profile.role,
                    },
                    candidates: others.filter(o => !matchedIds.has(o.participantId)).map(o => ({
                        participantId: o.participantId,
                        interests: o.interests,
                        expertise: o.expertise,
                        goals: o.goals,
                        lookingFor: o.lookingFor,
                        industry: o.industry,
                        role: o.role,
                    })),
                    limit,
                }),
            );

            const results: SmartMatchResult[] = response.data.matches || [];
            for (const r of results) {
                const [p1, p2] = [participantId, r.participantId].sort();
                await this.prisma.match.upsert({
                    where: {
                        eventId_participantId1_participantId2: { eventId, participantId1: p1, participantId2: p2 },
                    },
                    update: { score: r.score, matchedBy: 'ai', matchedAt: new Date() },
                    create: {
                        eventId,
                        participantId1: p1,
                        participantId2: p2,
                        score: r.score,
                        matchedBy: 'ai',
                        status: 'pending',
                        matchedAt: new Date(),
                    },
                });
            }

            return results;
        } catch {
            return this.fallbackSmartMatch(profile, others, matchedIds, limit);
        }
    }

    private fallbackSmartMatch(profile: any, others: any[], matchedIds: Set<string>, limit: number): SmartMatchResult[] {
        const results: SmartMatchResult[] = [];
        const myInterests = new Set((profile.interests || []).map((s: string) => s.toLowerCase().trim()));
        const myLookingFor = new Set((profile.lookingFor || []).map((s: string) => s.toLowerCase().trim()));

        for (const other of others) {
            if (matchedIds.has(other.participantId)) continue;

            const theirInterests = new Set((other.interests || []).map((s: string) => s.toLowerCase().trim()));
            const theirExpertise = new Set((other.expertise || []).map((s: string) => s.toLowerCase().trim()));

            const interestOverlap = [...myInterests].filter(i => theirInterests.has(i)).length;
            const expertiseMatch = [...myLookingFor].filter(l => theirExpertise.has(l)).length;

            const score = Math.max(interestOverlap, expertiseMatch) / Math.max(myInterests.size || 1, myLookingFor.size || 1);

            if (score < 0.2) continue;

            let reason: string;
            if (interestOverlap > 0) {
                reason = `Shared ${interestOverlap} interest(s)`;
            } else {
                reason = `Expertise matches your needs`;
            }

            results.push({
                participantId: other.participantId,
                score: Math.round(score * 100) / 100,
                reason,
                suggestedIcebreaker: `Hi! I noticed you're interested in ${[...theirInterests].slice(0, 2).join(', ')}. I work in ${profile.industry || 'tech'} - would love to connect!`,
            });
        }

        results.sort((a, b) => b.score - a.score);
        return results.slice(0, limit);
    }

    async generateIcebreaker(eventId: string, participantId: string, targetId: string): Promise<IcebreakerResult> {
        const [profile, target] = await Promise.all([
            this.prisma.participantProfile.findUnique({ where: { participantId } }),
            this.prisma.participantProfile.findUnique({ where: { participantId: targetId } }),
        ]);

        if (!profile || !target) throw new NotFoundException('Profile not found');

        try {
            const response = await firstValueFrom(
                this.http.post(`${this.baseUrl}/v1/networking/icebreaker`, {
                    sender: {
                        interests: profile.interests,
                        expertise: profile.expertise,
                        industry: profile.industry,
                        role: profile.role,
                        bio: profile.bio,
                    },
                    receiver: {
                        interests: target.interests,
                        expertise: target.expertise,
                        industry: target.industry,
                        role: target.role,
                        bio: target.bio,
                    },
                }),
            );
            return response.data;
        } catch {
            return this.fallbackIcebreaker(profile, target);
        }
    }

    private fallbackIcebreaker(profile: any, target: any): IcebreakerResult {
        const commonInterests = (profile.interests || []).filter((i: string) =>
            (target.interests || []).some((t: string) => t.toLowerCase() === i.toLowerCase()),
        );

        let topic: string;
        let icebreaker: string;

        if (commonInterests.length > 0) {
            topic = commonInterests[0];
            icebreaker = `I see we both share an interest in ${topic}! What drew you to that area?`;
        } else if (target.industry) {
            topic = target.industry;
            icebreaker = `How do you see the ${target.industry} landscape evolving this year? I'd love to hear your perspective.`;
        } else {
            topic = 'networking';
            icebreaker = `Hi! I'm exploring new connections at this event. What brought you here?`;
        }

        return {
            icebreaker,
            topic,
            context: `${profile.role || 'Professional'} connecting with ${target.role || 'participant'}`,
        };
    }

    async generateConversationStarters(eventId: string, participantId: string): Promise<{ starters: string[] }> {
        const profile = await this.prisma.participantProfile.findUnique({
            where: { participantId },
        });
        if (!profile) throw new NotFoundException('Profile not found');

        const matches = await this.prisma.match.findMany({
            where: {
                eventId,
                OR: [{ participantId1: participantId }, { participantId2: participantId }],
                status: { in: ['pending', 'matched'] },
            },
            include: {
                participant1: true,
                participant2: true,
            },
            take: 5,
        });

        const starters: string[] = [];
        for (const match of matches) {
            const target = match.participantId1 === participantId ? match.participant2 : match.participant1;
            const common = (profile.interests || []).filter((i: string) =>
                (target.interests || []).some((t: string) => t.toLowerCase() === i.toLowerCase()),
            );
            if (common.length > 0) {
                starters.push(`Based on your shared interest in ${common[0]}: "I noticed you're into ${common[0]} as well. What inspired your interest in that?"`);
            } else {
                starters.push(`General opener: "Hi! I'm ${profile.role || 'a participant'} here. What sessions have you enjoyed so far?"`);
            }
        }

        if (starters.length === 0) {
            starters.push(`Ask about their goals: "What are you hoping to get out of this event?"`);
            starters.push(`Industry conversation: "What trends in ${profile.industry || 'your field'} are you most excited about?"`);
        }

        return { starters };
    }

    async getInsights(eventId: string, participantId: string) {
        const profile = await this.prisma.participantProfile.findUnique({
            where: { participantId },
            include: {
                matchesAs1: { orderBy: { score: 'desc' }, take: 5 },
                matchesAs2: { orderBy: { score: 'desc' }, take: 5 },
                connectionsAs1: { take: 5 },
                connectionsAs2: { take: 5 },
                recommendations: { orderBy: { score: 'desc' }, take: 5 },
            },
        });
        if (!profile) throw new NotFoundException('Profile not found');

        const allMatches = [
            ...profile.matchesAs1.map(m => ({ ...m, otherId: m.participantId2 })),
            ...profile.matchesAs2.map(m => ({ ...m, otherId: m.participantId1 })),
        ];

        const topMatchScore = allMatches.length > 0
            ? Math.max(...allMatches.map(m => m.score))
            : 0;

        const nearbyCount = await this.prisma.proximityEvent.count({
            where: { eventId, participantId, departedAt: null },
        });

        const analysis = await this.analyzeProfile(eventId, participantId).catch(() => this.fallbackAnalysis(profile));

        return {
            profile,
            analysis,
            networkingStats: {
                totalMatches: allMatches.length,
                totalConnections: profile.connectionsAs1.length + profile.connectionsAs2.length,
                topMatchScore,
                currentlyNearby: nearbyCount > 0,
                recommendationsCount: profile.recommendations.length,
            },
            topMatches: allMatches.slice(0, 5),
            recentRecommendations: profile.recommendations,
        };
    }
}
