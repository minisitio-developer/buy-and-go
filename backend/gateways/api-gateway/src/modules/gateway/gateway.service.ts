import { Injectable, HttpException, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GatewayService {
    private serviceMap: Record<string, string> = {
        identity: process.env.IDENTITY_SERVICE_URL || 'http://identity:3001',
        event: process.env.EVENT_SERVICE_URL || 'http://event:3002',
        ticket: process.env.TICKET_SERVICE_URL || 'http://ticket:3003',
        checkin: process.env.CHECKIN_SERVICE_URL || 'http://checkin:3004',
        crm: process.env.CRM_SERVICE_URL || 'http://crm:3005',
        sponsor: process.env.SPONSOR_SERVICE_URL || 'http://sponsor:3006',
        payment: process.env.PAYMENT_SERVICE_URL || 'http://payment:3007',
        ai: process.env.AI_SERVICE_URL || 'http://ai:8000',
    };

    constructor(
        private readonly httpService: HttpService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) {}

    private getCacheKey(service: string, path: string, query?: Record<string, string>): string {
        const queryString = query ? `?${new URLSearchParams(query).toString()}` : '';
        return `gateway:${service}:${path}${queryString}`;
    }

    async proxy(
        service: string,
        path: string,
        method: string,
        body?: any,
        headers?: any,
        query?: Record<string, string>,
    ) {
        const baseUrl = this.serviceMap[service];
        if (!baseUrl) {
            throw new HttpException(`Service '${service}' not found`, 404);
        }

        if (method === 'GET') {
            const cacheKey = this.getCacheKey(service, path, query);
            const cached = await this.cacheManager.get(cacheKey);
            if (cached) {
                return {
                    status: 200,
                    data: cached,
                    headers: { 'X-Cache': 'HIT' },
                };
            }
        }

        const url = `${baseUrl}/v1/${path}`;
        const forwardedHeaders: Record<string, string> = {};

        if (headers) {
            const allowedHeaders = ['authorization', 'content-type', 'x-request-id', 'user-agent'];
            for (const key of Object.keys(headers)) {
                if (allowedHeaders.includes(key.toLowerCase())) {
                    forwardedHeaders[key] = headers[key];
                }
            }
        }

        try {
            const axiosConfig: any = {
                method: method.toLowerCase(),
                url,
                headers: forwardedHeaders,
                validateStatus: () => true,
            };

            if (body && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
                axiosConfig.data = body;
            }

            if (query && method === 'GET') {
                axiosConfig.params = query;
            }

            const response = await firstValueFrom(this.httpService.request(axiosConfig));

            const responseHeaders: Record<string, string> = {};
            if (response.headers) {
                const exposedHeaders = ['content-type', 'x-request-id', 'x-ratelimit-remaining'];
                for (const key of Object.keys(response.headers)) {
                    if (exposedHeaders.includes(key.toLowerCase())) {
                        responseHeaders[key] = response.headers[key];
                    }
                }
            }

            if (response.status >= 400) {
                throw new HttpException(
                    response.data?.message || `Upstream service error`,
                    response.status,
                );
            }

            if (method === 'GET' && response.status < 400) {
                const cacheKey = this.getCacheKey(service, path, query);
                const ttl = parseInt(process.env.CACHE_TTL || '300', 10);
                await this.cacheManager.set(cacheKey, response.data, ttl * 1000);
                responseHeaders['X-Cache'] = 'MISS';
            }

            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
                this.invalidateRelatedCaches(service, path);
            }

            return {
                status: response.status,
                data: response.data,
                headers: responseHeaders,
            };
        } catch (error: any) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                error?.response?.data?.message || 'Service unavailable',
                error?.response?.status || 503,
            );
        }
    }

    private async invalidateRelatedCaches(service: string, path: string) {
        const segments = path.split('/');
        const resourcePrefix = segments[0];

        try {
            const keys = await this.cacheManager.store.keys(`gateway:${service}:${resourcePrefix}*`);
            for (const key of keys) {
                await this.cacheManager.del(key);
            }
        } catch {
            // cache invalidation is best-effort
        }
    }

    async checkServiceHealth(service: string): Promise<boolean> {
        const baseUrl = this.serviceMap[service];
        if (!baseUrl) {
            return false;
        }

        try {
            const response = await firstValueFrom(
                this.httpService.get(`${baseUrl}/v1/health`, {
                    timeout: 3000,
                    validateStatus: () => true,
                }),
            );
            return response.status < 500;
        } catch {
            return false;
        }
    }
}
