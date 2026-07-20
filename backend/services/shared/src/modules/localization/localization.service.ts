import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class LocalizationService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(locale?: string, module?: string) {
        const where: any = {};
        if (locale) where.locale = locale;
        if (module) where.module = module;
        return this.prisma.localizationKey.findMany({ where, orderBy: { key: 'asc' } });
    }

    async findByKey(locale: string, key: string) {
        const entry = await this.prisma.localizationKey.findUnique({
            where: { locale_key: { locale, key } },
        });
        if (!entry) throw new NotFoundException(`Translation not found for ${locale}:${key}`);
        return entry;
    }

    async getTranslation(locale: string, key: string, defaultValue?: string) {
        try {
            const entry = await this.findByKey(locale, key);
            return entry.value;
        } catch {
            if (defaultValue !== undefined) return defaultValue;
            if (locale !== 'en') return this.getTranslation('en', key, key);
            return key;
        }
    }

    async getLocaleBundle(locale: string, module?: string) {
        const entries = await this.findAll(locale, module);
        const bundle: Record<string, string> = {};
        for (const entry of entries) {
            bundle[entry.key] = entry.value;
        }
        return bundle;
    }

    async upsert(locale: string, key: string, value: string, module?: string) {
        return this.prisma.localizationKey.upsert({
            where: { locale_key: { locale, key } },
            create: { locale, key, value, module },
            update: { value, module },
        });
    }

    async bulkUpsert(entries: { locale: string; key: string; value: string; module?: string }[]) {
        const results = [];
        for (const entry of entries) {
            results.push(await this.upsert(entry.locale, entry.key, entry.value, entry.module));
        }
        return results;
    }

    async delete(locale: string, key: string) {
        await this.findByKey(locale, key);
        await this.prisma.localizationKey.delete({
            where: { locale_key: { locale, key } },
        });
    }
}
