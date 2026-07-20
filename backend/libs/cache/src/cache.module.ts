import { DynamicModule, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CacheInterceptor } from './decorators/cache.decorator';

export interface CacheModuleOptions {
    ttl?: number;
    maxItems?: number;
    store?: 'memory' | 'redis' | 'multi';
    global?: boolean;
    redis?: {
        host?: string;
        port?: number;
    };
}

@Module({})
export class CacheModule {
    static forRoot(options: CacheModuleOptions = {}): DynamicModule {
        return {
            module: CacheModule,
            global: options.global ?? true,
            providers: [
                { provide: 'CACHE_CONFIG', useValue: options },
                CacheService,
                CacheInterceptor,
            ],
            exports: [CacheService, CacheInterceptor],
        };
    }
}
