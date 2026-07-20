import { DynamicModule, Global, Module } from '@nestjs/common';
import { I18nService } from './i18n.service';

export interface I18nModuleOptions {
    defaultLocale?: string;
    fallbackLocale?: string;
    loader?: (locale: string) => Record<string, string> | Promise<Record<string, string>>;
}

export interface I18nAsyncOptions {
    useFactory: (...args: any[]) => I18nModuleOptions | Promise<I18nModuleOptions>;
    inject?: any[];
    imports?: any[];
}

@Global()
@Module({})
export class I18nModule {
    static forRoot(options: I18nModuleOptions = {}): DynamicModule {
        const {
            defaultLocale = 'pt-BR',
            fallbackLocale = 'en',
            loader,
        } = options;

        const providers = [
            {
                provide: I18nService,
                useFactory: async () => {
                    const service = new I18nService(defaultLocale, fallbackLocale);

                    if (loader) {
                        const localesToLoad = [defaultLocale, fallbackLocale];
                        const added = new Set<string>();

                        for (const loc of localesToLoad) {
                            if (added.has(loc)) continue;
                            added.add(loc);
                            try {
                                const translations = await loader(loc);
                                service.loadTranslations(loc, translations);
                            } catch {
                            }
                        }
                    }

                    return service;
                },
            },
        ];

        return {
            module: I18nModule,
            providers,
            exports: [I18nService],
        };
    }

    static forRootAsync(options: I18nAsyncOptions): DynamicModule {
        const providers = [
            {
                provide: I18nService,
                useFactory: async (...args: any[]) => {
                    const config: I18nModuleOptions = await options.useFactory(...args);
                    const {
                        defaultLocale = 'pt-BR',
                        fallbackLocale = 'en',
                        loader,
                    } = config;

                    const service = new I18nService(defaultLocale, fallbackLocale);

                    if (loader) {
                        const localesToLoad = [defaultLocale, fallbackLocale];
                        const added = new Set<string>();

                        for (const loc of localesToLoad) {
                            if (added.has(loc)) continue;
                            added.add(loc);
                            try {
                                const translations = await loader(loc);
                                service.loadTranslations(loc, translations);
                            } catch {
                            }
                        }
                    }

                    return service;
                },
                inject: options.inject || [],
            },
        ];

        return {
            module: I18nModule,
            imports: options.imports || [],
            providers,
            exports: [I18nService],
        };
    }
}
