import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class ProductsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: {
        organizationId: string;
        eventId?: string;
        type: string;
        name: string;
        description?: string;
        price: number;
        currency?: string;
        media?: any;
        metadata?: any;
    }) {
        return this.prisma.product.create({
            data: {
                organizationId: data.organizationId,
                eventId: data.eventId,
                type: data.type,
                name: data.name,
                description: data.description,
                price: data.price,
                currency: data.currency || 'BRL',
                media: data.media || undefined,
                metadata: data.metadata || undefined,
            },
        });
    }

    async findAll(params: {
        organizationId?: string;
        eventId?: string;
        type?: string;
        status?: string;
        search?: string;
        page?: number;
        perPage?: number;
    }) {
        const { organizationId, eventId, type, status, search, page = 1, perPage = 20 } = params;
        const where: any = {};

        if (organizationId) where.organizationId = organizationId;
        if (eventId) where.eventId = eventId;
        if (type) where.type = type;
        if (status) where.status = status;
        else where.status = 'active';
        if (search) where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
        ];

        const [data, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { createdAt: 'desc' },
                include: { _count: { select: { reviews: true } } },
            }),
            this.prisma.product.count({ where }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async findById(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                reviews: { orderBy: { createdAt: 'desc' }, take: 10 },
                downloadables: { orderBy: { sortOrder: 'asc' } },
                _count: { select: { reviews: true } },
            },
        });
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    async update(id: string, data: any) {
        await this.findById(id);
        return this.prisma.product.update({ where: { id }, data });
    }

    async remove(id: string) {
        await this.findById(id);
        await this.prisma.review.deleteMany({ where: { productId: id } });
        await this.prisma.downloadable.deleteMany({ where: { productId: id } });
        return this.prisma.product.delete({ where: { id } });
    }
}
