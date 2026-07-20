import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

interface FlagConditions {
    orgIds?: string[];
    userIds?: string[];
    percentage?: number;
    startAt?: string;
    endAt?: string;
}

@Injectable()
export class FeatureFlagsService {
    private readonly logger = new Logger(FeatureFlagsService.name);
    private cache = new Map<string, { enabled: boolean; conditions: FlagConditions | null }>();
    private cacheTtl = 30000;
    private lastCacheRefresh = 0;

    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
        return this.prisma.featureFlag.findMany({ orderBy: { name: 'asc' } });
    }

    async findByKey(key: string) {
        const flag = await this.prisma.featureFlag.findUnique({ where: { key } });
        if (!flag) throw new NotFoundException(`Feature flag ${key} not found`);
        return flag;
    }

    async create(dto: { name: string; key: string; description?: string; enabled?: boolean; conditions?: FlagConditions }) {
        const existing = await this.prisma.featureFlag.findUnique({ where: { key: dto.key } });
        if (existing) throw new ConflictException(`Feature flag ${dto.key} already exists`);
        const flag = await this.prisma.featureFlag.create({ data: dto as any });
        this.invalidateCache();
        return flag;
    }

    async update(key: string, dto: { name?: string; description?: string; enabled?: boolean; conditions?: FlagConditions }) {
        await this.findByKey(key);
        const flag = await this.prisma.featureFlag.update({ where: { key }, data: dto as any });
        this.invalidateCache();
        return flag;
    }

    async delete(key: string) {
        await this.findByKey(key);
        await this.prisma.featureFlag.delete({ where: { key } });
        this.invalidateCache();
    }

    async isEnabled(key: string, context?: { orgId?: string; userId?: string }): Promise<boolean> {
        await this.refreshCache();
        const cached = this.cache.get(key);
        if (!cached) return false;
        if (!cached.enabled) return false;
        if (!cached.conditions) return true;

        const conditions = cached.conditions;

        if (conditions.startAt && new Date(conditions.startAt) > new Date()) return false;
        if (conditions.endAt && new Date(conditions.endAt) < new Date()) return false;

        if (context) {
            if (conditions.orgIds?.length && context.orgId && conditions.orgIds.includes(context.orgId)) return true;
            if (conditions.userIds?.length && context.userId && conditions.userIds.includes(context.userId)) return true;
            if (conditions.percentage !== undefined && context.userId) {
                const hash = this.hashString(context.userId) % 100;
                if (hash < conditions.percentage) return true;
            }
        }

        if (!conditions.orgIds?.length && !conditions.userIds?.length && conditions.percentage === undefined) return true;

        return false;
    }

    async evaluate(key: string, context?: { orgId?: string; userId?: string }) {
        const enabled = await this.isEnabled(key, context);
        return { key, enabled, context };
    }

    private async refreshCache() {
        const now = Date.now();
        if (now - this.lastCacheRefresh < this.cacheTtl) return;
        const flags = await this.prisma.featureFlag.findMany();
        this.cache.clear();
        for (const flag of flags) {
            this.cache.set(flag.key, {
                enabled: flag.enabled,
                conditions: flag.conditions as FlagConditions | null,
            });
        }
        this.lastCacheRefresh = now;
    }

    invalidateCache() {
        this.lastCacheRefresh = 0;
    }

    private hashString(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return Math.abs(hash);
    }
}
