import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class InstancesService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: {
        eventId: string;
        organizationId: string;
        name: string;
        appTemplateId: string;
        theme?: any;
        modules?: string[];
        config?: any;
    }) {
        return this.prisma.appInstance.create({
            data: {
                eventId: data.eventId,
                organizationId: data.organizationId,
                name: data.name,
                appTemplateId: data.appTemplateId,
                theme: data.theme || {},
                modules: data.modules || [],
                config: data.config || {},
                status: 'building',
            },
        });
    }

    async findByEvent(eventId: string) {
        return this.prisma.appInstance.findMany({
            where: { eventId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByOrganization(organizationId: string) {
        return this.prisma.appInstance.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string) {
        const instance = await this.prisma.appInstance.findUnique({
            where: { id },
            include: { template: true, builds: { orderBy: { createdAt: 'desc' } } },
        });
        if (!instance) throw new NotFoundException('App instance not found');
        return instance;
    }

    async update(id: string, data: Partial<{
        name: string;
        theme: any;
        modules: string[];
        config: any;
        status: string;
        buildUrl: string;
        qrCodeUrl: string;
    }>) {
        await this.findById(id);
        return this.prisma.appInstance.update({ where: { id }, data });
    }

    async remove(id: string) {
        await this.findById(id);
        await this.prisma.appBuild.deleteMany({ where: { appInstanceId: id } });
        return this.prisma.appInstance.delete({ where: { id } });
    }
}
