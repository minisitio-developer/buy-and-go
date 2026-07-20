import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class TemplatesService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: {
        name: string;
        description?: string;
        platform?: string;
        baseTemplate: string;
        configSchema?: any;
    }) {
        return this.prisma.appTemplate.create({
            data: {
                name: data.name,
                description: data.description,
                platform: data.platform || 'expo',
                baseTemplate: data.baseTemplate,
                configSchema: data.configSchema || {},
            },
        });
    }

    async findAll() {
        return this.prisma.appTemplate.findMany({ orderBy: { name: 'asc' } });
    }

    async findById(id: string) {
        const template = await this.prisma.appTemplate.findUnique({ where: { id } });
        if (!template) throw new NotFoundException('App template not found');
        return template;
    }

    async update(id: string, data: Partial<{
        name: string;
        description: string;
        platform: string;
        baseTemplate: string;
        configSchema: any;
    }>) {
        await this.findById(id);
        return this.prisma.appTemplate.update({ where: { id }, data });
    }

    async remove(id: string) {
        await this.findById(id);
        return this.prisma.appTemplate.delete({ where: { id } });
    }
}
