'use client';

import { useTranslation as useI18nextTranslation } from 'react-i18next';
import { useCallback } from 'react';

interface UseTranslationReturn {
    t: (key: string, params?: Record<string, string>) => string;
    locale: string;
    changeLanguage: (locale: string) => Promise<void>;
    i18n: any;
}

export function useTranslation(): UseTranslationReturn {
    const { t: i18nT, i18n } = useI18nextTranslation();

    const t = useCallback(
        (key: string, params?: Record<string, string>): string => {
            if (params) {
                return i18nT(key, params);
            }
            return i18nT(key);
        },
        [i18nT],
    );

    return {
        t,
        locale: i18n.language,
        changeLanguage: async (locale: string) => { await i18n.changeLanguage(locale) },
        i18n,
    };
}
