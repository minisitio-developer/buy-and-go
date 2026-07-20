export type CacheStore = 'memory' | 'redis' | 'multi';

export interface CacheConfig {
    ttl?: number;
    maxItems?: number;
    store?: CacheStore;
}

export interface CacheOptions {
    ttl?: number;
    tags?: string[];
    skipCache?: boolean;
}

export interface CacheMetrics {
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
    hitRate: number;
    size: number;
}

export interface ICacheService {
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T, ttl?: number, options?: CacheOptions): Promise<void>;
    del(key: string): Promise<void>;
    clear(): Promise<void>;
    wrap<T>(key: string, fn: () => Promise<T>, ttl?: number, options?: CacheOptions): Promise<T>;
    getOrSet<T>(key: string, fn: () => Promise<T>, ttl?: number, options?: CacheOptions): Promise<T>;
    invalidatePattern(pattern: string): Promise<void>;
    invalidateTag(tag: string): Promise<void>;
    mget<T>(keys: string[]): Promise<(T | undefined)[]>;
    mset<T>(entries: { key: string; value: T; ttl?: number; options?: CacheOptions }[]): Promise<void>;
    healthCheck(): Promise<{ status: 'ok' | 'degraded' | 'down'; redis: boolean; memory: boolean; uptime: number }>;
    getMetrics(): CacheMetrics;
}
