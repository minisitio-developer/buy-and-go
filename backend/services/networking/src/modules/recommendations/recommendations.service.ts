import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class RecommendationsService {
    private readonly logger = new Logger(RecommendationsService.name);

    constructor(private readonly prisma: PrismaService) {}

    @Cron('0 */15 * * * *')
    async scheduledGeneration() {
        this.logger.log('Running scheduled recommendation generation...');
        const events = await this.prisma.participantProfile.findMany({
            select: { eventId: true },
            distinct: ['eventId'],
        });
        for (const evt of events) {
            await this.generate(evt.eventId).catch(e =>
                this.logger.error(`Scheduled recommendation failed for event ${evt.eventId}`, e),
            );
        }
    }

    async generate(eventId: string, participantId?: string) {
        const profiles = await this.prisma.participantProfile.findMany({
            where: participantId ? { eventId, participantId } : { eventId },
        });

        if (profiles.length === 0) return { generated: 0 };

        const targetProfiles = participantId
            ? profiles
            : await this.prisma.participantProfile.findMany({ where: { eventId } });

        let generated = 0;

        for (const profile of profiles) {
            const recommendations = await this.computeRecommendations(profile, targetProfiles, eventId);
            for (const rec of recommendations) {
                await this.prisma.recommendation.create({ data: rec }).then(() => generated++).catch(() => {});
            }
        }

        return { generated };
    }

    private async computeRecommendations(
        profile: any,
        allProfiles: any[],
        eventId: string,
    ): Promise<Array<{
        eventId: string;
        participantId: string;
        targetId: string;
        reason: string;
        score: number;
        type: string;
    }>> {
        const recommendations: Array<{
            eventId: string;
            participantId: string;
            targetId: string;
            reason: string;
            score: number;
            type: string;
        }> = [];

        const myInterests: string[] = profile.interests || [];
        const myExpertise: string[] = profile.expertise || [];
        const myLookingFor: string[] = profile.lookingFor || [];

        const others = allProfiles.filter(p => p.participantId !== profile.participantId);

        for (const other of others) {
            const theirInterests: string[] = other.interests || [];
            const theirExpertise: string[] = other.expertise || [];

            const interestOverlap = this.jaccardSimilarity(myInterests, theirInterests);
            const expertiseComplement = this.jaccardSimilarity(myLookingFor, theirExpertise);

            const maxScore = Math.max(interestOverlap, expertiseComplement);
            if (maxScore < 0.2) continue;

            let reason: string;
            let type = 'participant';

            if (interestOverlap >= 0.4) {
                reason = `Shared interest in ${myInterests.slice(0, 2).join(', ')}`;
            } else if (expertiseComplement >= 0.3) {
                reason = `Has expertise in ${theirExpertise.slice(0, 2).join(', ')} that matches your needs`;
            } else {
                reason = `Similar role in ${other.industry || 'your industry'}`;
            }

            recommendations.push({
                eventId,
                participantId: profile.participantId,
                targetId: other.participantId,
                reason,
                score: Math.round(maxScore * 100) / 100,
                type,
            });
        }

        const matchData = await this.prisma.match.findMany({
            where: {
                eventId,
                OR: [
                    { participantId1: profile.participantId },
                    { participantId2: profile.participantId },
                ],
                status: 'matched',
            },
        });

        for (const match of matchData) {
            const targetId = match.participantId1 === profile.participantId
                ? match.participantId2
                : match.participantId1;
            recommendations.push({
                eventId,
                participantId: profile.participantId,
                targetId,
                reason: `Strong match (score: ${match.score}) - connect now!`,
                score: match.score,
                type: 'participant',
            });
        }

        recommendations.sort((a, b) => b.score - a.score);
        return recommendations.slice(0, 20);
    }

    private jaccardSimilarity(a: string[], b: string[]): number {
        if (a.length === 0 && b.length === 0) return 0;
        const setA = new Set(a.map(s => s.toLowerCase().trim()));
        const setB = new Set(b.map(s => s.toLowerCase().trim()));
        const intersection = new Set([...setA].filter(x => setB.has(x)));
        const union = new Set([...setA, ...setB]);
        return union.size === 0 ? 0 : intersection.size / union.size;
    }

    async findByEvent(eventId: string, params: {
        participantId: string; type?: string; minScore?: number; page?: number; perPage?: number;
    }) {
        const { participantId, type, minScore, page = 1, perPage = 20 } = params;
        const where: any = { eventId, participantId };
        if (type) where.type = type;
        if (minScore !== undefined) where.score = { gte: minScore };

        const [data, total] = await Promise.all([
            this.prisma.recommendation.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { score: 'desc' },
            }),
            this.prisma.recommendation.count({ where }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async remove(id: string) {
        await this.prisma.recommendation.delete({ where: { id } });
        return { deleted: true };
    }
}
