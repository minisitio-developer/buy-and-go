import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { StripeService } from '../../infra/stripe/stripe.service';

@Injectable()
export class DownloadsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly stripe: StripeService,
    ) {}

    async create(data: {
        productId: string;
        fileUrl: string;
        fileSize?: number;
        fileType?: string;
        title: string;
        sortOrder?: number;
    }) {
        const product = await this.prisma.product.findUnique({ where: { id: data.productId } });
        if (!product) throw new NotFoundException('Product not found');

        return this.prisma.downloadable.create({
            data: {
                productId: data.productId,
                fileUrl: data.fileUrl,
                fileSize: data.fileSize || 0,
                fileType: data.fileType || 'application/octet-stream',
                title: data.title,
                sortOrder: data.sortOrder || 0,
            },
        });
    }

    async findByProduct(productId: string) {
        const product = await this.prisma.product.findUnique({ where: { id: productId } });
        if (!product) throw new NotFoundException('Product not found');

        return this.prisma.downloadable.findMany({
            where: { productId },
            orderBy: { sortOrder: 'asc' },
        });
    }

    async findById(id: string) {
        const downloadable = await this.prisma.downloadable.findUnique({ where: { id } });
        if (!downloadable) throw new NotFoundException('Downloadable not found');
        return downloadable;
    }

    async generateSignedUrl(id: string) {
        const downloadable = await this.findById(id);
        const signedUrl = await this.stripe.generateSignedUrl(downloadable.fileUrl);
        return { url: signedUrl, title: downloadable.title, fileType: downloadable.fileType, fileSize: downloadable.fileSize };
    }

    async update(id: string, data: any) {
        await this.findById(id);
        return this.prisma.downloadable.update({ where: { id }, data });
    }

    async remove(id: string) {
        await this.findById(id);
        return this.prisma.downloadable.delete({ where: { id } });
    }

    async reorder(items: Array<{ id: string; sortOrder: number }>) {
        for (const item of items) {
            await this.prisma.downloadable.update({
                where: { id: item.id },
                data: { sortOrder: item.sortOrder },
            });
        }
        return { success: true };
    }
}
