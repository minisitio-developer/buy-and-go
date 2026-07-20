import {
    Injectable,
    Inject,
    Logger,
    OnModuleDestroy,
} from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import type { ICacheService, CacheOptions, CacheMetrics, CacheStore } from './interfaces/cache.interface';
import type { CacheModuleOptions } from './cache.module';

interface CacheEntry {
    value: unknown;
    expiry: number;
}

interface RedisStoreWrapper {
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    clear(): Promise<void>;
}

@Injectable()
export class CacheService implements ICacheService, OnModuleDestroy {
    private readonly logger = new Logger(CacheService.name);

    private readonly l1Cache: Map<string, CacheEntry>;
    private readonly tagIndex: Map<string, Set<string>>;
    private readonly keyTags: Map<string, string[]>;
    private redisCache: RedisStoreWrapper | null = null;

    private redisAvailable = false;
    private readonly defaultTtl: number;
    private readonly maxItems: number;
    private readonly storeType: CacheStore;

    private readonly metricsData = { hits: 0, misses: 0, sets: 0, deletes: 0 };
    private readonly startTime = Date.now();

    private readonly invalidationSubject = new Subject<string>();
    readonly invalidation$: Observable<string> = this.invalidationSubject.asObservable();

    private redisInitAttempted = false;

    constructor(@Inject('CACHE_CONFIG') private readonly config: CacheModuleOptions) {
        this.l1Cache = new Map();
        this.tagIndex = new Map();
        this.keyTags = new Map();
        this.defaultTtl = config.ttl ?? 300;
        this.maxItems = config.maxItems ?? 1000;
        this.storeType = config.store ?? 'memory';

        if (this.storeType !== 'memory') {
            this.initRedis();
        }
    }

    private async initRedis(): Promise<void> {
        if (this.redisInitAttempted) return;
        this.redisInitAttempted = true;
        try {
            const mod = await this.dynamicImportRedisYet();
            if (!mod) {
                this.logger.warn('cache-manager-redis-yet not available');
                this.redisAvailable = false;
                return;
            }
            const store = await mod.redisStore({
                socket: {
                    host: this.config.redis?.host || process.env.REDIS_HOST || 'localhost',
                    port: this.config.redis?.port || parseInt(process.env.REDIS_PORT || '6379', 10),
                },
                ttl: this.defaultTtl * 1000,
            });

            const cacheModule = await this.dynamicImportCacheManager();
            if (!cacheModule) {
                this.logger.warn('cache-manager not available');
                this.redisAvailable = false;
                return;
            }
            this.redisCache = await cacheModule.caching(store, { ttl: this.defaultTtl * 1000 } as any);
            this.redisAvailable = true;
            this.logger.log('Redis cache initialized successfully');
        } catch (err) {
            this.logger.warn('Redis unavailable, falling back to memory cache');
            this.redisAvailable = false;
        }
    }

    private async dynamicImportRedisYet(): Promise<typeof import('cache-manager-redis-yet') | null> {
        try {
            return await import('cache-manager-redis-yet');
        } catch {
            return null;
        }
    }

    private async dynamicImportCacheManager(): Promise<typeof import('cache-manager') | null> {
        try {
            return await import('cache-manager');
        } catch {
            return null;
        }
    }

    private get memoryEnabled(): boolean {
        return this.storeType === 'memory' || this.storeType === 'multi';
    }

    private get redisEnabled(): boolean {
        return this.storeType !== 'memory' && this.redisAvailable && this.redisCache !== null;
    }

    async get<T>(key: string): Promise<T | undefined> {
        if (this.memoryEnabled) {
            const entry = this.l1Cache.get(key);
            if (entry) {
                if (entry.expiry === 0 || Date.now() < entry.expiry) {
                    this.metricsData.hits++;
                    return entry.value as T;
                }
                this.l1Cache.delete(key);
                this.removeFromTagIndex(key);
            }
        }

        if (this.redisEnabled) {
            try {
                const val = await this.redisCache!.get<T>(key);
                if (val !== undefined && val !== null) {
                    this.metricsData.hits++;
                    if (this.memoryEnabled) {
                        this.l1Cache.set(key, { value: val, expiry: this.computeExpiry(this.defaultTtl) });
                    }
                    return val;
                }
            } catch (err) {
                this.logger.warn(`Redis get failed for key "${key}"`);
                this.redisAvailable = false;
            }
        }

        this.metricsData.misses++;
        return undefined;
    }

    async set<T>(key: string, value: T, ttl?: number, options?: CacheOptions): Promise<void> {
        this.metricsData.sets++;
        const effectiveTtl = ttl ?? options?.ttl ?? this.defaultTtl;

        if (this.memoryEnabled) {
            this.evictIfNeeded();
            this.l1Cache.set(key, { value, expiry: this.computeExpiry(effectiveTtl) });
        }

        if (this.redisEnabled) {
            try {
                await this.redisCache!.set(key, value, effectiveTtl);
            } catch (err) {
                this.logger.warn(`Redis set failed for key "${key}"`);
                this.redisAvailable = false;
            }
        }

        const tags = options?.tags;
        if (tags && tags.length > 0) {
            this.addToTagIndex(key, tags);
            if (this.redisEnabled) {
                await this.setTagIndexInRedis(key, tags);
            }
        }
    }

    async del(key: string): Promise<void> {
        this.metricsData.deletes++;
        this.l1Cache.delete(key);
        this.removeFromTagIndex(key);
        this.invalidationSubject.next(key);

        if (this.redisEnabled) {
            try {
                await this.redisCache!.del(key);
                await this.removeTagIndexFromRedis(key);
            } catch (err) {
                this.logger.warn(`Redis del failed for key "${key}"`);
                this.redisAvailable = false;
            }
        }
    }

    async clear(): Promise<void> {
        this.l1Cache.clear();
        this.tagIndex.clear();
        this.keyTags.clear();

        if (this.redisEnabled) {
            try {
                await this.redisCache!.clear();
            } catch (err) {
                this.logger.warn('Redis clear failed');
                this.redisAvailable = false;
            }
        }
    }

    async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number, options?: CacheOptions): Promise<T> {
        return this.getOrSet(key, fn, ttl, options);
    }

    async getOrSet<T>(key: string, fn: () => Promise<T>, ttl?: number, options?: CacheOptions): Promise<T> {
        if (!options?.skipCache) {
            const cached = await this.get<T>(key);
            if (cached !== undefined) {
                return cached;
            }
        }

        const value = await fn();
        await this.set(key, value, ttl ?? options?.ttl, options);
        return value;
    }

    async invalidateTag(tag: string): Promise<void> {
        const keys = this.tagIndex.get(tag);
        if (keys) {
            const keyArray = Array.from(keys);
            for (const key of keyArray) {
                this.l1Cache.delete(key);
                this.removeFromTagIndex(key);
                this.invalidationSubject.next(key);
            }
        }

        if (this.redisEnabled) {
            try {
                const redisKeys = await this.redisCache!.get<string[]>(`tag:${tag}`);
                if (redisKeys && Array.isArray(redisKeys)) {
                    for (const key of redisKeys) {
                        await this.redisCache!.del(key);
                    }
                }
                await this.redisCache!.del(`tag:${tag}`);
            } catch (err) {
                this.logger.warn(`Redis tag invalidation failed for tag "${tag}"`);
                this.redisAvailable = false;
            }
        }
    }

    async invalidatePattern(pattern: string): Promise<void> {
        const regex = this.patternToRegex(pattern);

        if (this.memoryEnabled) {
            const keysToDelete: string[] = [];
            for (const key of this.l1Cache.keys()) {
                if (regex.test(key)) {
                    keysToDelete.push(key);
                }
            }
            for (const key of keysToDelete) {
                this.l1Cache.delete(key);
                this.removeFromTagIndex(key);
                this.invalidationSubject.next(key);
            }
        }

        if (this.redisEnabled) {
            try {
                const allKeys = await this.scanRedisKeys('*');
                for (const key of allKeys) {
                    if (regex.test(key)) {
                        await this.redisCache!.del(key);
                    }
                }
            } catch (err) {
                this.logger.warn('Redis pattern invalidation failed');
                this.redisAvailable = false;
            }
        }
    }

    async mget<T>(keys: string[]): Promise<(T | undefined)[]> {
        return Promise.all(keys.map((key) => this.get<T>(key)));
    }

    async mset<T>(entries: { key: string; value: T; ttl?: number; options?: CacheOptions }[]): Promise<void> {
        await Promise.all(entries.map((e) => this.set(e.key, e.value, e.ttl, e.options)));
    }

    async healthCheck(): Promise<{
        status: 'ok' | 'degraded' | 'down';
        redis: boolean;
        memory: boolean;
        uptime: number;
    }> {
        let redisOk = false;
        if (this.redisInitAttempted) {
            try {
                if (this.redisCache) {
                    await this.redisCache.get('health:ping');
                    redisOk = true;
                }
            } catch {
                redisOk = false;
            }
        }

        const memoryOk = true;
        const redisConfigured = this.storeType !== 'memory';

        let status: 'ok' | 'degraded' | 'down';
        if (memoryOk && (!redisConfigured || redisOk)) {
            status = 'ok';
        } else if (memoryOk) {
            status = 'degraded';
        } else {
            status = 'down';
        }

        return { status, redis: redisOk, memory: memoryOk, uptime: Math.floor((Date.now() - this.startTime) / 1000) };
    }

    getMetrics(): CacheMetrics {
        const total = this.metricsData.hits + this.metricsData.misses;
        const hitRate = total > 0 ? this.metricsData.hits / total : 0;
        return {
            ...this.metricsData,
            hitRate: Math.round(hitRate * 10000) / 10000,
            size: this.l1Cache.size,
        };
    }

    async onModuleDestroy(): Promise<void> {
        this.l1Cache.clear();
        this.tagIndex.clear();
        this.keyTags.clear();
        this.redisCache = null;
    }

    private computeExpiry(ttlSeconds: number): number {
        return ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : 0;
    }

    private evictIfNeeded(): void {
        while (this.l1Cache.size >= this.maxItems) {
            const firstKey = this.l1Cache.keys().next().value;
            if (firstKey !== undefined) {
                this.l1Cache.delete(firstKey);
                this.removeFromTagIndex(firstKey);
            } else {
                break;
            }
        }
    }

    private addToTagIndex(key: string, tags: string[]): void {
        for (const tag of tags) {
            if (!this.tagIndex.has(tag)) {
                this.tagIndex.set(tag, new Set());
            }
            this.tagIndex.get(tag)!.add(key);
        }
        this.keyTags.set(key, tags);
    }

    private removeFromTagIndex(key: string): void {
        const tags = this.keyTags.get(key);
        if (tags) {
            for (const tag of tags) {
                const keys = this.tagIndex.get(tag);
                if (keys) {
                    keys.delete(key);
                    if (keys.size === 0) {
                        this.tagIndex.delete(tag);
                    }
                }
            }
            this.keyTags.delete(key);
        }
    }

    private async setTagIndexInRedis(key: string, tags: string[]): Promise<void> {
        if (!this.redisCache) return;
        for (const tag of tags) {
            const existing = (await this.redisCache.get<string[]>(`tag:${tag}`)) || [];
            if (!existing.includes(key)) {
                existing.push(key);
                await this.redisCache.set(`tag:${tag}`, existing);
            }
        }
        await this.redisCache.set(`keytags:${key}`, tags);
    }

    private async removeTagIndexFromRedis(key: string): Promise<void> {
        if (!this.redisCache) return;
        try {
            const tags = await this.redisCache.get<string[]>(`keytags:${key}`);
            if (tags && Array.isArray(tags)) {
                for (const tag of tags) {
                    const existing = (await this.redisCache.get<string[]>(`tag:${tag}`)) || [];
                    const filtered = existing.filter((k: string) => k !== key);
                    if (filtered.length > 0) {
                        await this.redisCache.set(`tag:${tag}`, filtered);
                    } else {
                        await this.redisCache.del(`tag:${tag}`);
                    }
                }
            }
            await this.redisCache.del(`keytags:${key}`);
        } catch (err) {
            this.logger.warn(`Redis tag index removal failed for key "${key}"`);
        }
    }

    private async scanRedisKeys(pattern: string): Promise<string[]> {
        if (!this.redisCache) return [];
        try {
            const allKeys = await this.redisCache.get<string[]>('__keys__');
            if (allKeys && Array.isArray(allKeys)) {
                const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
                return allKeys.filter((k) => regex.test(k));
            }
        } catch {
        }
        return [];
    }

    private patternToRegex(pattern: string): RegExp {
        const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
        const regexStr = escaped.replace(/\*/g, '.*').replace(/\?/g, '.');
        return new RegExp(`^${regexStr}$`);
    }
}
