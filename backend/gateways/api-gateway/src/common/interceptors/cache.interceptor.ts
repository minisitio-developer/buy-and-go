import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
    private readonly ttlMap: Record<string, number> = {
        identity: 60,
        event: 300,
        ticket: 120,
        checkin: 30,
        crm: 300,
        sponsor: 300,
        payment: 60,
        ai: 60,
    };

    constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest<Request>();
        const { method, path, query } = request;

        if (method !== 'GET') {
            return next.handle().pipe(
                tap({
                    next: () => this.invalidateCache(path),
                }),
            );
        }

        const cacheKey = this.buildCacheKey(request);
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return of(cached);
        }

        return next.handle().pipe(
            tap({
                next: (response) => this.storeCache(cacheKey, request, response),
            }),
        );
    }

    private buildCacheKey(request: Request): string {
        const segments = request.path.split('/');
        const service = segments[2] || 'unknown';
        const queryString = request.query ? `?${new URLSearchParams(request.query as any).toString()}` : '';
        return `gateway:${service}:${request.path}${queryString}`;
    }

    private getTtl(request: Request): number {
        const segments = request.path.split('/');
        const service = segments[2] || 'general';
        return this.ttlMap[service] || 300;
    }

    private async storeCache(cacheKey: string, request: Request, response: any) {
        const ttl = this.getTtl(request);
        await this.cacheManager.set(cacheKey, response, ttl * 1000);
    }

    private async invalidateCache(path: string) {
        const segments = path.split('/');
        const service = segments[2] || 'unknown';
        const resourcePrefix = segments[3] || '';

        try {
            const keys = await this.cacheManager.store.keys(`gateway:${service}:*${resourcePrefix}*`);
            for (const key of keys) {
                await this.cacheManager.del(key);
            }
        } catch {
            // best-effort
        }
    }
}
