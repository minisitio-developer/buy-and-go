import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class ConnectorsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: {
        organizationId: string;
        name: string;
        type: string;
        config: any;
    }) {
        return this.prisma.dataConnector.create({
            data: {
                organizationId: data.organizationId,
                name: data.name,
                type: data.type as any,
                config: data.config,
            },
        });
    }

    async findAll(organizationId: string, params: { type?: string; page?: number; perPage?: number }) {
        const { type, page = 1, perPage = 20 } = params;
        const where: any = { organizationId };
        if (type) where.type = type;

        const [data, total] = await Promise.all([
            this.prisma.dataConnector.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.dataConnector.count({ where }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async findById(id: string) {
        const connector = await this.prisma.dataConnector.findUnique({ where: { id } });
        if (!connector) throw new NotFoundException('Connector not found');
        return connector;
    }

    async update(id: string, data: any) {
        await this.findById(id);
        return this.prisma.dataConnector.update({ where: { id }, data });
    }

    async remove(id: string) {
        await this.findById(id);
        return this.prisma.dataConnector.delete({ where: { id } });
    }
}
