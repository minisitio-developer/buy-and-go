import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { TriggersService } from '../triggers/triggers.service';

@Injectable()
export class ExecutionsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly triggers: TriggersService,
    ) {}

    async execute(workflowId: string, payload?: any) {
        const workflow = await this.prisma.workflow.findUnique({
            where: { id: workflowId },
            include: { steps: { orderBy: { order: 'asc' } } },
        });
        if (!workflow) throw new NotFoundException('Workflow not found');
        if (!workflow.enabled) throw new BadRequestException('Workflow is disabled');

        return this.triggers.executeWorkflow(workflow, { payload });
    }

    async findByWorkflow(workflowId: string, params: {
        status?: string; page?: number; perPage?: number;
    }) {
        const { status, page = 1, perPage = 20 } = params;
        const where: any = { workflowId };
        if (status) where.status = status;

        const [data, total] = await Promise.all([
            this.prisma.workflowExecution.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { createdAt: 'desc' },
                include: {
                    steps: {
                        orderBy: { startedAt: 'asc' },
                    },
                },
            }),
            this.prisma.workflowExecution.count({ where }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async findByOrganization(organizationId: string, params: {
        status?: string; page?: number; perPage?: number;
    }) {
        const { status, page = 1, perPage = 20 } = params;
        const where: any = { workflow: { organizationId } };
        if (status) where.status = status;

        const [data, total] = await Promise.all([
            this.prisma.workflowExecution.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { createdAt: 'desc' },
                include: {
                    workflow: { select: { id: true, name: true, organizationId: true } },
                    steps: { orderBy: { startedAt: 'asc' } },
                },
            }),
            this.prisma.workflowExecution.count({ where }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async findById(id: string) {
        const execution = await this.prisma.workflowExecution.findUnique({
            where: { id },
            include: {
                workflow: true,
                steps: {
                    orderBy: { startedAt: 'asc' },
                    include: { stepId: true },
                },
            },
        });
        if (!execution) throw new NotFoundException('Execution not found');
        return execution;
    }
}
