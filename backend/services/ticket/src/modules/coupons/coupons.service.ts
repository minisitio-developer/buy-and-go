import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class CouponsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: {
        organizationId: string;
        eventId?: string;
        code: string;
        discountType: string;
        discountValue: number;
        maxUses?: number;
        validFrom?: string;
        validUntil?: string;
    }) {
        return this.prisma.coupon.create({
            data: {
                organizationId: data.organizationId,
                eventId: data.eventId,
                code: data.code.toUpperCase(),
                discountType: data.discountType,
                discountValue: data.discountValue,
                maxUses: data.maxUses,
                validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
                validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
            },
        });
    }

    async validate(code: string, eventId: string, total: number) {
        const coupon = await this.prisma.coupon.findUnique({
            where: { eventId_code: { eventId, code: code.toUpperCase() } },
        });

        if (!coupon) throw new NotFoundException('Coupon not found');
        if (!coupon.isActive) throw new BadRequestException('Coupon is inactive');
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            throw new BadRequestException('Coupon usage limit reached');
        }
        if (coupon.validUntil && new Date() > coupon.validUntil) {
            throw new BadRequestException('Coupon expired');
        }
        if (coupon.validFrom && new Date() < coupon.validFrom) {
            throw new BadRequestException('Coupon not yet valid');
        }

        const discount = coupon.discountType === 'percentage'
            ? (total * Number(coupon.discountValue)) / 100
            : Number(coupon.discountValue);

        return {
            coupon,
            discount: Math.min(discount, total),
            totalAfterDiscount: total - Math.min(discount, total),
        };
    }

    async findByEvent(eventId: string) {
        return this.prisma.coupon.findMany({ where: { eventId } });
    }

    async remove(id: string) {
        const coupon = await this.prisma.coupon.findUnique({ where: { id } });
        if (!coupon) throw new NotFoundException('Coupon not found');
        return this.prisma.coupon.delete({ where: { id } });
    }
}
