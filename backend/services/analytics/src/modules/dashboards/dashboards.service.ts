import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class DashboardsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: {
        organizationId: string;
        name: string;
        description?: string;
        widgets?: any[];
        layout?: any;
    }) {
        return this.prisma.analyticsDashboard.create({
            data: {
                organizationId: data.organizationId,
                name: data.name,
                description: data.description,
                widgets: data.widgets || [],
                layout: data.layout || {},
            },
        });
    }

    async findByOrganization(organizationId: string) {
        return this.prisma.analyticsDashboard.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string) {
        const dashboard = await this.prisma.analyticsDashboard.findUnique({ where: { id } });
        if (!dashboard) throw new NotFoundException('Dashboard not found');
        return dashboard;
    }

    async update(id: string, data: any) {
        await this.findById(id);
        return this.prisma.analyticsDashboard.update({ where: { id }, data });
    }

    async remove(id: string) {
        await this.findById(id);
        return this.prisma.analyticsDashboard.delete({ where: { id } });
    }
}
