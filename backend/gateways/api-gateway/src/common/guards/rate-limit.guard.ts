import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
    protected async getTracker(req: Record<string, any>): Promise<string> {
        return req.ip || req.connection?.remoteAddress || 'unknown';
    }

    protected getLimit(context: ExecutionContext): number {
        const request = context.switchToHttp().getRequest();
        const path = request.path || '';
        const method = request.method || 'GET';

        if (path.includes('/auth/login') || path.includes('/auth/register')) {
            return 5;
        }

        if (path.includes('/api/checkin')) {
            return 60;
        }

        if (path.includes('/api/ai') || path.includes('/reports')) {
            return 10;
        }

        return 100;
    }

    protected getTtl(context: ExecutionContext): number {
        return 60000;
    }
}
