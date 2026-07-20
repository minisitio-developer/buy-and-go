'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { isSupportedLocale, type SupportedLocale } from '@/lib/i18n';

const FLAGS: Record<SupportedLocale, string> = {
    'pt-BR': '🇧🇷',
    en: '🇺🇸',
    es: '🇪🇸',
};

const LABELS: Record<SupportedLocale, string> = {
    'pt-BR': 'Português',
    en: 'English',
    es: 'Español',
};

interface LanguageSwitcherProps {
    className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
    const { i18n, locale } = useTranslation();

    const handleChange = (newLocale: string) => {
        if (isSupportedLocale(newLocale)) {
            i18n.changeLanguage(newLocale);
            localStorage.setItem('locale', newLocale);
        }
    };

    const currentLocale = isSupportedLocale(locale) ? locale : 'pt-BR';

    return (
        <div className={className}>
            <select
                value={currentLocale}
                onChange={(e) => handleChange(e.target.value)}
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                aria-label={i18n.t('common.settings')}
            >
                {(Object.keys(LABELS) as SupportedLocale[]).map((loc) => (
                    <option key={loc} value={loc}>
                        {FLAGS[loc]} {LABELS[loc]}
                    </option>
                ))}
            </select>
        </div>
    );
}
