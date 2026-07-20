import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { PrismaService } from '../../infra/database/prisma.service';
import * as cronParser from 'cron-parser';

@Injectable()
export class SchedulerService {
    private readonly logger = new Logger(SchedulerService.name);
    private readonly handlers = new Map<string, () => Promise<void>>();

    constructor(
        private readonly prisma: PrismaService,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) {}

    registerHandler(name: string, handler: () => Promise<void>) {
        this.handlers.set(name, handler);
    }

    async findAll() {
        return this.prisma.scheduledTask.findMany({ orderBy: { name: 'asc' } });
    }

    async findById(id: string) {
        const task = await this.prisma.scheduledTask.findUnique({ where: { id } });
        if (!task) throw new NotFoundException(`Scheduled task ${id} not found`);
        return task;
    }

    async create(dto: {
        name: string; type: 'cron' | 'interval'; schedule: string;
        handler: string; enabled?: boolean;
    }) {
        const existing = await this.prisma.scheduledTask.findUnique({ where: { name: dto.name } });
        if (existing) throw new ConflictException(`Scheduled task ${dto.name} already exists`);

        const nextRunAt = this.calculateNextRun(dto.type, dto.schedule);
        const task = await this.prisma.scheduledTask.create({
            data: {
                name: dto.name,
                type: dto.type,
                schedule: dto.schedule,
                handler: dto.handler,
                enabled: dto.enabled ?? true,
                nextRunAt,
            },
        });

        if (task.enabled) this.scheduleTask(task);
        return task;
    }

    async update(id: string, dto: {
        name?: string; type?: 'cron' | 'interval'; schedule?: string;
        handler?: string; enabled?: boolean;
    }) {
        const task = await this.findById(id);
        const data: any = { ...dto };
        if (dto.schedule || dto.type) {
            data.nextRunAt = this.calculateNextRun(
                dto.type || task.type,
                dto.schedule || task.schedule,
            );
        }

        const updated = await this.prisma.scheduledTask.update({
            where: { id },
            data,
        });

        this.rescheduleTask(updated);
        return updated;
    }

    async delete(id: string) {
        await this.findById(id);
        await this.prisma.scheduledTask.delete({ where: { id } });
        this.unscheduleTask(id);
    }

    async executeNow(id: string) {
        const task = await this.findById(id);
        await this.runTask(task);
        return { executed: true, task: task.name };
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async processScheduledJobs() {
        const now = new Date();
        const dueTasks = await this.prisma.scheduledTask.findMany({
            where: {
                enabled: true,
                nextRunAt: { lte: now },
            },
        });

        for (const task of dueTasks) {
            await this.runTask(task);
        }
    }

    private async runTask(task: any) {
        this.logger.log(`Running scheduled task: ${task.name}`);

        const handler = this.handlers.get(task.handler);
        if (!handler) {
            this.logger.warn(`No handler registered for task: ${task.name} (handler: ${task.handler})`);
            return;
        }

        try {
            await handler();
            const nextRunAt = this.calculateNextRun(task.type, task.schedule);
            await this.prisma.scheduledTask.update({
                where: { id: task.id },
                data: { lastRunAt: new Date(), nextRunAt },
            });
            this.logger.log(`Task ${task.name} completed, next run: ${nextRunAt}`);
        } catch (error) {
            this.logger.error(`Task ${task.name} failed`, error);
        }
    }

    private calculateNextRun(type: string, schedule: string): Date {
        if (type === 'cron') {
            try {
                const interval = cronParser.parseExpression(schedule);
                return interval.next().toDate();
            } catch {
                const future = new Date();
                future.setMinutes(future.getMinutes() + 1);
                return future;
            }
        }
        const future = new Date();
        const ms = parseInt(schedule, 10);
        future.setMilliseconds(future.getMilliseconds() + (isNaN(ms) ? 60000 : ms));
        return future;
    }

    private scheduleTask(task: any) {
        this.logger.log(`Scheduled task ${task.name} registered (next run: ${task.nextRunAt})`);
    }

    private unscheduleTask(id: string) {
        try {
            this.schedulerRegistry.deleteCronJob(id);
        } catch {}
    }

    private rescheduleTask(task: any) {
        this.unscheduleTask(task.id);
        if (task.enabled) this.scheduleTask(task);
    }
}
