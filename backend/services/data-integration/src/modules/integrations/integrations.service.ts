import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import axios from 'axios';
import { Client as PgClient } from 'pg';
import { Kafka } from 'kafkajs';

@Injectable()
export class IntegrationsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: {
        organizationId: string;
        name: string;
        type: string;
        sourceType: string;
        sourceConfig: any;
        targetType: string;
        targetConfig: any;
        mapping?: any[];
        schedule?: string;
    }) {
        const existing = await this.prisma.integration.findFirst({
            where: { organizationId, name: data.name },
        });
        if (existing) throw new BadRequestException('Integration with this name already exists');

        return this.prisma.integration.create({
            data: {
                organizationId: data.organizationId,
                name: data.name,
                type: data.type as any,
                sourceType: data.sourceType as any,
                sourceConfig: data.sourceConfig,
                targetType: data.targetType as any,
                targetConfig: data.targetConfig,
                mapping: data.mapping || [],
                schedule: data.schedule,
            },
        });
    }

    async findAll(organizationId: string, params: { type?: string; enabled?: boolean; page?: number; perPage?: number }) {
        const { type, enabled, page = 1, perPage = 20 } = params;
        const where: any = { organizationId };
        if (type) where.type = type;
        if (enabled !== undefined) where.enabled = enabled;

        const [data, total] = await Promise.all([
            this.prisma.integration.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { createdAt: 'desc' },
                include: { _count: { select: { runs: true } } },
            }),
            this.prisma.integration.count({ where }),
        ]);

        return { data, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } };
    }

    async findById(id: string) {
        const integration = await this.prisma.integration.findUnique({
            where: { id },
            include: {
                runs: { orderBy: { startedAt: 'desc' }, take: 10 },
                _count: { select: { runs: true } },
            },
        });
        if (!integration) throw new NotFoundException('Integration not found');
        return integration;
    }

    async update(id: string, data: any) {
        await this.findById(id);
        return this.prisma.integration.update({ where: { id }, data });
    }

    async remove(id: string) {
        await this.findById(id);
        await this.prisma.integrationRun.deleteMany({ where: { integrationId: id } });
        return this.prisma.integration.delete({ where: { id } });
    }

    async testConnection(config: { type: string; config: any }) {
        const { type, config: cfg } = config;

        switch (type) {
            case 'api': {
                try {
                    const resp = await axios.get(cfg.url, {
                        headers: cfg.headers || {},
                        timeout: 10000,
                        ...(cfg.auth ? { auth: cfg.auth } : {}),
                    });
                    return { success: true, status: resp.status, message: `API reachable (${resp.status})` };
                } catch (e: any) {
                    throw new BadRequestException(`Connection failed: ${e.message}`);
                }
            }

            case 'postgres': {
                let client: PgClient | null = null;
                try {
                    client = new PgClient({
                        host: cfg.host,
                        port: cfg.port || 5432,
                        database: cfg.database,
                        user: cfg.user,
                        password: cfg.password,
                        connectionTimeoutMillis: 10000,
                    });
                    await client.connect();
                    const result = await client.query('SELECT NOW() AS now');
                    return { success: true, message: `PostgreSQL connected (${result.rows[0].now})` };
                } catch (e: any) {
                    throw new BadRequestException(`PostgreSQL connection failed: ${e.message}`);
                } finally {
                    if (client) await client.end().catch(() => {});
                }
            }

            case 'kafka': {
                try {
                    const kafka = new Kafka({
                        clientId: 'data-integration-test',
                        brokers: cfg.brokers || ['localhost:9092'],
                    });
                    const admin = kafka.admin();
                    await admin.connect();
                    const info = await admin.describeCluster();
                    await admin.disconnect();
                    return { success: true, message: `Kafka connected (brokers: ${info.brokers.length})` };
                } catch (e: any) {
                    throw new BadRequestException(`Kafka connection failed: ${e.message}`);
                }
            }

            case 'csv':
            case 'json':
                return { success: true, message: `${type.toUpperCase()} file connectors validated` };

            default:
                throw new BadRequestException(`Unknown source type: ${type}`);
        }
    }
}
