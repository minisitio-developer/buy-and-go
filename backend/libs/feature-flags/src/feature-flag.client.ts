import { Injectable, Logger } from '@nestjs/common';

export interface FlagEvaluationContext {
    orgId?: string;
    userId?: string;
    attributes?: Record<string, string>;
}

export interface FlagResult {
    key: string;
    enabled: boolean;
    source: 'cache' | 'api' | 'fallback';
}

export interface FeatureFlagClientOptions {
    baseUrl?: string;
    apiKey?: string;
    cacheTtlMs?: number;
    fallbacks?: Record<string, boolean>;
}

interface CachedFlag {
    enabled: boolean;
    conditions: {
        orgIds?: string[];
        userIds?: string[];
        percentage?: number;
        startAt?: string;
        endAt?: string;
    } | null;
    fetchedAt: number;
}

@Injectable()
export class FeatureFlagClient {
    private readonly logger = new Logger(FeatureFlagClient.name);
    private readonly baseUrl: string;
    private readonly apiKey: string;
    private readonly cacheTtlMs: number;
    private readonly fallbacks: Record<string, boolean>;
    private cache = new Map<string, CachedFlag>();
    private pendingRefreshes = new Map<string, Promise<CachedFlag | null>>();

    constructor(options: FeatureFlagClientOptions = {}) {
        this.baseUrl = options.baseUrl || process.env.FEATURE_FLAG_URL || 'http://localhost:3013/v1/feature-flags';
        this.apiKey = options.apiKey || process.env.FEATURE_FLAG_API_KEY || '';
        this.cacheTtlMs = options.cacheTtlMs || 30000;
        this.fallbacks = options.fallbacks || {};
    }

    async isEnabled(key: string, context?: FlagEvaluationContext): Promise<boolean> {
        const result = await this.evaluate(key, context);
        return result.enabled;
    }

    async evaluate(key: string, context?: FlagEvaluationContext): Promise<FlagResult> {
        const cached = this.getCached(key);
        if (cached) {
            const enabled = this.evaluateConditions(cached, context);
            return { key, enabled, source: 'cache' };
        }

        try {
            const flag = await this.fetchFlag(key);
            if (flag) {
                this.setCache(key, flag);
                const enabled = this.evaluateConditions(flag, context);
                return { key, enabled, source: 'api' };
            }
        } catch (error) {
            this.logger.warn(`Failed to fetch flag ${key}, using fallback`, error);
        }

        const fallback = this.fallbacks[key] ?? false;
        return { key, enabled: fallback, source: 'fallback' };
    }

    async evaluateBulk(keys: string[], context?: FlagEvaluationContext): Promise<FlagResult[]> {
        return Promise.all(keys.map(key => this.evaluate(key, context)));
    }

    invalidateCache(key?: string) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }

    private getCached(key: string): CachedFlag | null {
        const cached = this.cache.get(key);
        if (!cached) return null;
        if (Date.now() - cached.fetchedAt > this.cacheTtlMs) {
            this.cache.delete(key);
            return null;
        }
        return cached;
    }

    private setCache(key: string, flag: CachedFlag) {
        this.cache.set(key, { ...flag, fetchedAt: Date.now() });
    }

    private async fetchFlag(key: string): Promise<CachedFlag | null> {
        if (this.pendingRefreshes.has(key)) {
            return this.pendingRefreshes.get(key)!;
        }

        const promise = this.doFetch(key);
        this.pendingRefreshes.set(key, promise);

        try {
            return await promise;
        } finally {
            this.pendingRefreshes.delete(key);
        }
    }

    private async doFetch(key: string): Promise<CachedFlag | null> {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;

        const response = await fetch(`${this.baseUrl}/${key}`, { headers });

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`Feature flag API returned ${response.status}`);
        }

        const data = await response.json();
        return {
            enabled: data.enabled,
            conditions: data.conditions || null,
            fetchedAt: Date.now(),
        };
    }

    private evaluateConditions(flag: CachedFlag, context?: FlagEvaluationContext): boolean {
        if (!flag.enabled) return false;
        if (!flag.conditions) return true;

        const conditions = flag.conditions;

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
