import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import * as Handlebars from 'handlebars';

@Injectable()
export class TemplatesService {
    private readonly logger = new Logger(TemplatesService.name);

    constructor(private readonly prisma: PrismaService) {}

    async create(data: {
        organizationId: string;
        name: string;
        type: string;
        content: string;
        variables?: string[];
        orientation?: string;
        pageSize?: string;
    }) {
        const variables = data.variables || this.extractVariablesFromContent(data.content);

        return this.prisma.documentTemplate.create({
            data: {
                organizationId: data.organizationId,
                name: data.name,
                type: data.type as any,
                content: data.content,
                variables,
                orientation: (data.orientation || 'portrait') as any,
                pageSize: data.pageSize || 'A4',
            },
        });
    }

    async findAll(organizationId: string, type?: string) {
        const where: any = { organizationId };
        if (type) where.type = type;

        return this.prisma.documentTemplate.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const template = await this.prisma.documentTemplate.findUnique({ where: { id } });
        if (!template) throw new NotFoundException('Template not found');
        return template;
    }

    async update(id: string, data: any) {
        const template = await this.findOne(id);
        const updateData: any = {};

        if (data.name !== undefined) updateData.name = data.name;
        if (data.content !== undefined) {
            updateData.content = data.content;
            updateData.variables = data.variables || this.extractVariablesFromContent(data.content);
        }
        if (data.type !== undefined) updateData.type = data.type;
        if (data.orientation !== undefined) updateData.orientation = data.orientation;
        if (data.pageSize !== undefined) updateData.pageSize = data.pageSize;
        if (data.variables !== undefined) updateData.variables = data.variables;

        return this.prisma.documentTemplate.update({ where: { id }, data: updateData });
    }

    async remove(id: string) {
        await this.findOne(id);
        await this.prisma.documentTemplate.delete({ where: { id } });
        return { deleted: true };
    }

    async preview(id: string, variables: Record<string, any>) {
        const template = await this.findOne(id);
        const compiled = Handlebars.compile(template.content);
        const html = compiled(variables);
        return { html };
    }

    extractVariables(content: string): string[] {
        return this.extractVariablesFromContent(content);
    }

    private extractVariablesFromContent(content: string): string[] {
        const regex = /\{\{([^#/]+?)\}\}/g;
        const matches = new Set<string>();
        let match: RegExpExecArray | null;

        while ((match = regex.exec(content)) !== null) {
            const varName = match[1].trim().split(' ')[0].split('.')[0];
            if (varName && !varName.includes(' ')) {
                matches.add(varName);
            }
        }

        return Array.from(matches);
    }
}
