import {
    SetMetadata,
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable, of, from } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { CacheService } from '../cache.service';
import type { CacheOptions } from '../interfaces/cache.interface';

export const CACHEABLE_KEY = 'cache:cacheable';

export interface CacheableOptions extends CacheOptions {
    key?: string;
    keyGenerator?: (...args: any[]) => string;
}

export const Cacheable = (options?: CacheableOptions): MethodDecorator => {
    return SetMetadata(CACHEABLE_KEY, options || {});
};

@Injectable()
export class CacheInterceptor implements NestInterceptor {
    constructor(private readonly cacheService: CacheService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const options = Reflect.getMetadata(CACHEABLE_KEY, context.getHandler()) as
            | CacheableOptions
            | undefined;

        if (!options || options.skipCache) {
            return next.handle();
        }

        const key = this.resolveKey(context, options);
        if (!key) {
            return next.handle();
        }

        return from(this.cacheService.get<any>(key)).pipe(
            switchMap((cached) => {
                if (cached !== undefined && cached !== null) {
                    return of(cached);
                }
                return next.handle().pipe(
                    switchMap((response) => {
                        if (response !== undefined && response !== null) {
                            return from(
                                this.cacheService.set(key, response, options!.ttl, {
                                    tags: options!.tags,
                                }),
                            ).pipe(map(() => response));
                        }
                        return of(response);
                    }),
                );
            }),
        );
    }

    private resolveKey(context: ExecutionContext, options: CacheableOptions): string {
        if (options.key) {
            return options.key;
        }

        const handler = context.getHandler();
        const controller = context.getClass();
        const args = this.getMethodArgs(context);

        if (options.keyGenerator) {
            return options.keyGenerator(...args);
        }

        const handlerName = handler.name || 'anonymous';
        const controllerName = controller?.name || 'Unknown';
        return `${controllerName}:${handlerName}`;
    }

    private getMethodArgs(context: ExecutionContext): any[] {
        try {
            const req = context.switchToHttp().getRequest();
            if (req) {
                return [req.params, req.query, req.body];
            }
        } catch {
        }

        try {
            const args = context.getArgs();
            if (Array.isArray(args) && args.length > 0) {
                return args;
            }
        } catch {
        }

        return [];
    }
}
