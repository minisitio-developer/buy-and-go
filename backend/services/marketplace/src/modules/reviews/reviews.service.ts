import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class ReviewsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: {
        productId: string;
        participantId: string;
        rating: number;
        comment?: string;
    }) {
        if (data.rating < 1 || data.rating > 5) {
            throw new ConflictException('Rating must be between 1 and 5');
        }

        const product = await this.prisma.product.findUnique({ where: { id: data.productId } });
        if (!product) throw new NotFoundException('Product not found');

        const existing = await this.prisma.review.findUnique({
            where: { productId_participantId: { productId: data.productId, participantId: data.participantId } },
        });

        if (existing) {
            throw new ConflictException('You have already reviewed this product');
        }

        return this.prisma.review.create({
            data: {
                productId: data.productId,
                participantId: data.participantId,
                rating: data.rating,
                comment: data.comment,
            },
        });
    }

    async findByProduct(productId: string, params: {
        page?: number; perPage?: number;
    }) {
        const { page = 1, perPage = 20 } = params;

        const [data, total] = await Promise.all([
            this.prisma.review.findMany({
                where: { productId },
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.review.count({ where: { productId } }),
        ]);

        const aggregate = await this.prisma.review.aggregate({
            where: { productId },
            _avg: { rating: true },
            _count: true,
        });

        return {
            data,
            pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
            summary: {
                averageRating: aggregate._avg.rating ? Number(aggregate._avg.rating.toFixed(1)) : 0,
                totalReviews: aggregate._count,
            },
        };
    }

    async update(id: string, participantId: string, data: { rating?: number; comment?: string }) {
        const review = await this.prisma.review.findUnique({ where: { id } });
        if (!review) throw new NotFoundException('Review not found');
        if (review.participantId !== participantId) {
            throw new ConflictException('You can only edit your own reviews');
        }

        return this.prisma.review.update({ where: { id }, data });
    }

    async remove(id: string, participantId: string) {
        const review = await this.prisma.review.findUnique({ where: { id } });
        if (!review) throw new NotFoundException('Review not found');
        if (review.participantId !== participantId) {
            throw new ConflictException('You can only delete your own reviews');
        }

        return this.prisma.review.delete({ where: { id } });
    }
}
