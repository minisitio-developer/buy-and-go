import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class PublishingService {
    constructor(private readonly prisma: PrismaService) {}

    async updateStoreUrls(instanceId: string, data: {
        appStoreUrl?: string;
        playStoreUrl?: string;
    }) {
        const instance = await this.prisma.appInstance.findUnique({ where: { id: instanceId } });
        if (!instance) throw new NotFoundException('App instance not found');

        return this.prisma.appInstance.update({
            where: { id: instanceId },
            data: {
                appStoreUrl: data.appStoreUrl,
                playStoreUrl: data.playStoreUrl,
            },
        });
    }

    async getPublicationStatus(instanceId: string) {
        const instance = await this.prisma.appInstance.findUnique({
            where: { id: instanceId },
            select: {
                id: true,
                name: true,
                status: true,
                buildUrl: true,
                appStoreUrl: true,
                playStoreUrl: true,
                qrCodeUrl: true,
                createdAt: true,
            },
        });
        if (!instance) throw new NotFoundException('App instance not found');
        return instance;
    }
}
