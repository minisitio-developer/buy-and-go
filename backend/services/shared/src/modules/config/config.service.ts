import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

export type ConfigScope = 'global' | 'organization' | 'service';

interface CreateConfigDto {
    scope: ConfigScope;
    scopeId?: string;
    key: string;
    value: any;
    description?: string;
}

interface UpdateConfigDto {
    value?: any;
    description?: string;
}

@Injectable()
export class ConfigService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(scope?: ConfigScope, scopeId?: string) {
        const where: any = {};
        if (scope) where.scope = scope;
        if (scopeId) where.scopeId = scopeId;
        return this.prisma.configuration.findMany({ where, orderBy: { key: 'asc' } });
    }

    async findByKey(key: string, scope: ConfigScope = 'global', scopeId?: string) {
        const config = await this.prisma.configuration.findUnique({
            where: { scope_scopeId_key: { scope, scopeId: scopeId ?? '', key } },
        });
        if (!config) throw new NotFoundException(`Configuration ${key} not found`);
        return config;
    }

    async getValue(key: string, scope: ConfigScope = 'global', scopeId?: string, defaultValue?: any) {
        try {
            const config = await this.findByKey(key, scope, scopeId);
            return config.value;
        } catch {
            if (defaultValue !== undefined) return defaultValue;
            if (scope !== 'global') {
                return this.getValue(key, 'global', undefined, defaultValue);
            }
            return null;
        }
    }

    async create(dto: CreateConfigDto) {
        const existing = await this.prisma.configuration.findUnique({
            where: { scope_scopeId_key: { scope: dto.scope, scopeId: dto.scopeId ?? '', key: dto.key } },
        });
        if (existing) throw new ConflictException(`Configuration ${dto.key} already exists in ${dto.scope}`);
        return this.prisma.configuration.create({
            data: {
                scope: dto.scope,
                scopeId: dto.scopeId,
                key: dto.key,
                value: dto.value,
                description: dto.description,
                version: 1,
            },
        });
    }

    async update(key: string, dto: UpdateConfigDto, scope: ConfigScope = 'global', scopeId?: string) {
        const config = await this.findByKey(key, scope, scopeId);
        const data: any = { version: config.version + 1 };
        if (dto.value !== undefined) data.value = dto.value;
        if (dto.description !== undefined) data.description = dto.description;
        return this.prisma.configuration.update({
            where: { id: config.id },
            data,
        });
    }

    async delete(key: string, scope: ConfigScope = 'global', scopeId?: string) {
        const config = await this.findByKey(key, scope, scopeId);
        await this.prisma.configuration.delete({ where: { id: config.id } });
    }
}
