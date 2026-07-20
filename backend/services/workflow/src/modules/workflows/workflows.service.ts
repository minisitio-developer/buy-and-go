import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class WorkflowsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: {
        organizationId: string;
        name: string;
        description?: string;
        trigger?: string;
        triggerConfig?: any;
    }) {
        const existing = await this.prisma.workflow.findFirst({
            where: { organizationId: data.organizationId, name: data.name },
        });
        if (existing) throw new ConflictException('Workflow with this name already exists');

        return this.prisma.workflow.create({
            data: {
                organizationId: data.organizationId,
                name: data.name,
                description: data.description,
                trigger: data.trigger || 'event',
                triggerConfig: data.triggerConfig || {},
            },
            include: { steps: { orderBy: { order: 'asc' } } },
        });
    }

    async findByOrganization(organizationId: string, params: {
        trigger?: string; enabled?: string; page?: number; perPage?: number;
    }) {
        const { trigger, enabled, page = 1, perPage = 20 } = params;
        const where: any = { organizationId };
        if (trigger) where.trigger = trigger;
        if (enabled !== undefined) where.enabled = enabled === 'true';

        const [data, total] = await Promise.all([
            this.prisma.workflow.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { updatedAt: 'desc' },
                include: { steps: { orderBy: { order: 'asc' } }, _count: { select: { executions: true } } },
            }),
            this.prisma.workflow.count({ where }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async findById(id: string) {
        const workflow = await this.prisma.workflow.findUnique({
            where: { id },
            include: {
                steps: { orderBy: { order: 'asc' } },
                executions: { orderBy: { createdAt: 'desc' }, take: 10 },
            },
        });
        if (!workflow) throw new NotFoundException('Workflow not found');
        return workflow;
    }

    async update(id: string, data: any) {
        await this.findById(id);
        return this.prisma.workflow.update({ where: { id }, data, include: { steps: { orderBy: { order: 'asc' } } } });
    }

    async remove(id: string) {
        await this.findById(id);
        return this.prisma.workflow.delete({ where: { id } });
    }

    async addStep(workflowId: string, data: { type: string; config?: any; dependsOn?: any }) {
        await this.findById(workflowId);

        const lastStep = await this.prisma.workflowStep.findFirst({
            where: { workflowId },
            orderBy: { order: 'desc' },
        });

        return this.prisma.workflowStep.create({
            data: {
                workflowId,
                type: data.type,
                config: data.config || {},
                order: (lastStep?.order ?? 0) + 1,
                dependsOn: data.dependsOn || undefined,
            },
        });
    }

    async updateStep(stepId: string, data: any) {
        const step = await this.prisma.workflowStep.findUnique({ where: { id: stepId } });
        if (!step) throw new NotFoundException('Step not found');
        return this.prisma.workflowStep.update({ where: { id: stepId }, data });
    }

    async removeStep(stepId: string) {
        const step = await this.prisma.workflowStep.findUnique({ where: { id: stepId } });
        if (!step) throw new NotFoundException('Step not found');
        await this.prisma.workflowStep.delete({ where: { id: stepId } });

        await this.prisma.workflowStep.updateMany({
            where: { workflowId: step.workflowId, order: { gt: step.order } },
            data: { order: { decrement: 1 } },
        });

        return { deleted: true };
    }

    async toggle(id: string) {
        const workflow = await this.findById(id);
        return this.prisma.workflow.update({
            where: { id },
            data: { enabled: !workflow.enabled },
        });
    }
}
