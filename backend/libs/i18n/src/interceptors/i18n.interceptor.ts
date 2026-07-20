import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { I18nService } from '../i18n.service';

@Injectable()
export class I18nInterceptor implements NestInterceptor {
    constructor(private readonly i18nService: I18nService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        const queryLocale = request.query?.locale as string | undefined;
        const headerLocale = request.headers?.['accept-language'] as string | undefined;

        let locale = 'pt-BR';

        if (queryLocale) {
            locale = queryLocale;
        } else if (headerLocale) {
            const parsed = headerLocale.split(',')[0]?.split(';')[0]?.trim();
            if (parsed) locale = parsed;
        }

        request.i18nLocale = locale;
        this.i18nService.setLocale(locale);

        return next.handle();
    }
}
