'use client';

import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { i18n, detectBrowserLocale, isSupportedLocale } from './i18n';

interface I18nProviderProps {
    children: ReactNode;
    locale?: string;
}

export function I18nProvider({ children, locale }: I18nProviderProps) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const targetLocale = locale || detectBrowserLocale();
        if (isSupportedLocale(targetLocale) && targetLocale !== i18n.language) {
            i18n.changeLanguage(targetLocale);
        }
        setReady(true);
    }, [locale]);

    if (!ready) {
        return <>{children}</>;
    }

    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
