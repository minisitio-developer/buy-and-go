import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

interface CreateAuditLogDto {
    organizationId?: string;
    userId?: string;
    eventType: string;
    resource: string;
    resourceId?: string;
    action: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}

interface AuditQuery {
    organizationId?: string;
    userId?: string;
    eventType?: string;
    resource?: string;
    resourceId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    perPage?: number;
}

@Injectable()
export class AuditService {
    private readonly logger = new Logger(AuditService.name);

    constructor(private readonly prisma: PrismaService) {}

    async log(dto: CreateAuditLogDto) {
        const log = await this.prisma.auditLog.create({
            data: {
                organizationId: dto.organizationId,
                userId: dto.userId,
                eventType: dto.eventType,
                resource: dto.resource,
                resourceId: dto.resourceId,
                action: dto.action,
                details: dto.details ?? undefined,
                ipAddress: dto.ipAddress,
                userAgent: dto.userAgent,
            },
        });
        this.logger.debug(`Audit log created: ${dto.eventType} on ${dto.resource}`);
        return log;
    }

    async query(params: AuditQuery) {
        const where: any = {};
        if (params.organizationId) where.organizationId = params.organizationId;
        if (params.userId) where.userId = params.userId;
        if (params.eventType) where.eventType = params.eventType;
        if (params.resource) where.resource = params.resource;
        if (params.resourceId) where.resourceId = params.resourceId;
        if (params.action) where.action = params.action;
        if (params.startDate || params.endDate) {
            where.createdAt = {};
            if (params.startDate) where.createdAt.gte = new Date(params.startDate);
            if (params.endDate) where.createdAt.lte = new Date(params.endDate);
        }

        const page = params.page || 1;
        const perPage = Math.min(params.perPage || 50, 100);

        const [data, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.auditLog.count({ where }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async getRetentionStats() {
        const result = await this.prisma.auditLog.aggregate({
            _min: { createdAt: true },
            _max: { createdAt: true },
            _count: true,
        });
        return {
            totalLogs: result._count,
            oldest: result._min.createdAt,
            newest: result._max.createdAt,
        };
    }

    async applyRetentionPolicy(retentionDays: number) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - retentionDays);

        const deleted = await this.prisma.auditLog.deleteMany({
            where: { createdAt: { lt: cutoff } },
        });

        this.logger.log(`Retention policy applied: deleted ${deleted.count} logs older than ${retentionDays} days`);
        return { deletedCount: deleted.count, cutoffDate: cutoff };
    }
}
