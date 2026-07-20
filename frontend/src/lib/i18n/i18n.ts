import i18next, { i18n as I18nInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import ptBR from './locales/pt-BR.json';
import en from './locales/en.json';
import es from './locales/es.json';

const SUPPORTED_LOCALES = ['pt-BR', 'en', 'es'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function isSupportedLocale(locale: string): locale is SupportedLocale {
    return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

export function detectBrowserLocale(): SupportedLocale {
    if (typeof window === 'undefined') return 'pt-BR';

    const stored = localStorage.getItem('locale');
    if (stored && isSupportedLocale(stored)) return stored;

    const browserLang = navigator.language;
    if (browserLang.startsWith('pt')) return 'pt-BR';
    if (browserLang.startsWith('es')) return 'es';
    return 'en';
}

export function createI18nInstance(language?: string): I18nInstance {
    const instance = i18next.createInstance();

    instance.use(initReactI18next).init({
        resources: {
            'pt-BR': { translation: ptBR },
            en: { translation: en },
            es: { translation: es },
        },
        lng: language || detectBrowserLocale(),
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
            prefix: '{',
            suffix: '}',
        },
        returnNull: false,
        returnEmptyString: false,
    });

    return instance;
}

export const i18n = createI18nInstance();
export default i18n;
