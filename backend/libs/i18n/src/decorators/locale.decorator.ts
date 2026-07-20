import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Locale = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest();

        const queryLocale = request.query?.locale as string | undefined;
        if (queryLocale) return queryLocale;

        const headerLocale = request.headers?.['accept-language'] as string | undefined;
        if (headerLocale) {
            const parsed = headerLocale.split(',')[0]?.split(';')[0]?.trim();
            if (parsed) return parsed;
        }

        return request.i18nLocale || 'pt-BR';
    },
);
