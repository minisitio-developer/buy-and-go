import { Injectable } from '@nestjs/common';

interface TranslationValue {
    [key: string]: string | TranslationValue;
}

@Injectable()
export class I18nService {
    private translations: Map<string, TranslationValue> = new Map();
    private currentLocale: string = 'pt-BR';
    private fallbackLocale: string = 'en';

    constructor(
        defaultLocale?: string,
        fallbackLocale?: string,
        initialTranslations?: Map<string, TranslationValue>,
    ) {
        if (defaultLocale) this.currentLocale = defaultLocale;
        if (fallbackLocale) this.fallbackLocale = fallbackLocale;
        if (initialTranslations) this.translations = initialTranslations;
    }

    setLocale(locale: string): void {
        this.currentLocale = locale;
    }

    getLocale(): string {
        return this.currentLocale;
    }

    loadTranslations(locale: string, translations: Record<string, string>): void {
        const existing = this.translations.get(locale) || {};
        const merged = this.mergeDeep(existing, translations);
        this.translations.set(locale, merged);
    }

    t(key: string, locale?: string, params?: Record<string, string>): string {
        const targetLocale = locale || this.currentLocale;
        const locales = [targetLocale, this.fallbackLocale];

        for (const loc of locales) {
            const translations = this.translations.get(loc);
            if (!translations) continue;

            const value = this.resolveKey(translations, key);
            if (value !== undefined) {
                return this.interpolate(value, params);
            }
        }

        return this.interpolate(key, params);
    }

    private resolveKey(obj: TranslationValue, key: string): string | undefined {
        const parts = key.split('.');
        let current: TranslationValue | string | undefined = obj;

        for (const part of parts) {
            if (typeof current !== 'object' || current === null) {
                return undefined;
            }
            current = (current as TranslationValue)[part];
        }

        return typeof current === 'string' ? current : undefined;
    }

    private interpolate(template: string, params?: Record<string, string>): string {
        if (!params) return template;
        return template.replace(/\{(\w+)\}/g, (_, key) => params[key] ?? `{${key}}`);
    }

    private mergeDeep(target: TranslationValue, source: Record<string, string>): TranslationValue {
        const result: TranslationValue = { ...target };

        for (const [key, value] of Object.entries(source)) {
            const parts = key.split('.');
            let current = result;

            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                if (!current[part] || typeof current[part] !== 'object') {
                    current[part] = {};
                }
                current = current[part] as TranslationValue;
            }

            current[parts[parts.length - 1]] = value;
        }

        return result;
    }
}
