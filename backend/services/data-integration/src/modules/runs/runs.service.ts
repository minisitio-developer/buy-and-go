import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { SyncEngineService } from '../sync/sync-engine.service';

@Injectable()
export class RunsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly syncEngine: SyncEngineService,
    ) {}

    async execute(integrationId: string) {
        const integration = await this.prisma.integration.findUnique({ where: { id: integrationId } });
        if (!integration) throw new NotFoundException('Integration not found');
        if (!integration.enabled) throw new BadRequestException('Integration is disabled');

        const existing = await this.prisma.integrationRun.findFirst({
            where: { integrationId, status: 'running' },
        });
        if (existing) throw new BadRequestException('Integration is already running');

        const run = await this.prisma.integrationRun.create({
            data: {
                integrationId,
                status: 'running',
                startedAt: new Date(),
            },
        });

        this.syncEngine.execute(integration, run.id).catch(async (err) => {
            await this.prisma.integrationRun.update({
                where: { id: run.id },
                data: {
                    status: 'failed',
                    completedAt: new Date(),
                    error: err.message,
                    log: { error: err.stack },
                },
            });
        });

        return run;
    }

    async findByIntegration(integrationId: string, params: { status?: string; page?: number; perPage?: number }) {
        const { status, page = 1, perPage = 20 } = params;
        const where: any = { integrationId };
        if (status) where.status = status;

        const [data, total] = await Promise.all([
            this.prisma.integrationRun.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { startedAt: 'desc' },
            }),
            this.prisma.integrationRun.count({ where }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async findById(id: string) {
        const run = await this.prisma.integrationRun.findUnique({
            where: { id },
            include: { integration: true },
        });
        if (!run) throw new NotFoundException('Run not found');
        return run;
    }

    async retryFailed(id: string) {
        const run = await this.findById(id);
        if (run.status !== 'failed') throw new BadRequestException('Can only retry failed runs');
        return this.execute(run.integrationId);
    }

    async cancel(id: string) {
        const run = await this.findById(id);
        if (run.status === 'completed' || run.status === 'cancelled') {
            throw new BadRequestException('Run is already finished');
        }
        return this.prisma.integrationRun.update({
            where: { id },
            data: { status: 'cancelled', completedAt: new Date() },
        });
    }
}
