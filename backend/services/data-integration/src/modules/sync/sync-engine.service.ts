import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../infra/database/prisma.service';
import axios from 'axios';
import { parse as csvParse } from 'csv-parse/sync';
import { stringify as csvStringify } from 'csv-stringify/sync';
import { Client as PgClient } from 'pg';
import { Kafka } from 'kafkajs';

interface FieldMapping {
    source: string;
    target: string;
    transform?: {
        type: 'rename' | 'format' | 'concat' | 'lookup';
        params?: Record<string, any>;
    };
    defaultValue?: any;
}

interface SyncContext {
    integration: any;
    runId: string;
    recordsProcessed: number;
    recordsFailed: number;
    errors: string[];
    lastSyncAt?: Date;
}

@Injectable()
export class SyncEngineService {
    private readonly logger = new Logger(SyncEngineService.name);
    private kafkaClients: Map<string, Kafka> = new Map();
    private pgClients: Map<string, PgClient> = new Map();

    constructor(private readonly prisma: PrismaService) {}

    async execute(integration: any, runId: string) {
        const ctx: SyncContext = {
            integration,
            runId,
            recordsProcessed: 0,
            recordsFailed: 0,
            errors: [],
            lastSyncAt: integration.lastRunAt || undefined,
        };

        try {
            this.logger.log(`Starting integration ${integration.id} (${integration.name})`);

            const data = await this.readSource(integration, ctx);
            if (!data || data.length === 0) {
                this.logger.log(`No data to process for integration ${integration.id}`);
                await this.completeRun(runId, ctx);
                return;
            }

            const transformed = this.applyMapping(data, integration.mapping || []);
            const validated = this.validateRecords(transformed);
            ctx.recordsFailed = validated.errors.length;
            ctx.errors.push(...validated.errors);

            if (validated.valid.length > 0) {
                await this.writeTarget(integration, validated.valid, ctx);
            }

            ctx.recordsProcessed = validated.valid.length;
            await this.completeRun(runId, ctx);

            await this.prisma.integration.update({
                where: { id: integration.id },
                data: { lastRunAt: new Date() },
            });

            this.logger.log(`Integration ${integration.id} completed: ${ctx.recordsProcessed} processed, ${ctx.recordsFailed} failed`);
        } catch (err: any) {
            this.logger.error(`Integration ${integration.id} failed: ${err.message}`, err.stack);
            ctx.errors.push(err.message);
            await this.failRun(runId, err, ctx);
        }
    }

    private async readSource(integration: any, ctx: SyncContext): Promise<any[]> {
        switch (integration.sourceType) {
            case 'csv': return this.readCsv(integration.sourceConfig);
            case 'json': return this.readJson(integration.sourceConfig);
            case 'api': return this.readApi(integration.sourceConfig, ctx);
            case 'postgres': return this.readPostgres(integration.sourceConfig, ctx);
            case 'kafka': return this.readKafka(integration.sourceConfig, ctx);
            default: throw new Error(`Unsupported source type: ${integration.sourceType}`);
        }
    }

    private async readCsv(config: any): Promise<any[]> {
        if (config.content) {
            return csvParse(config.content, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
                delimiter: config.delimiter || ',',
            });
        }
        if (config.filePath) {
            const fs = require('fs');
            const content = fs.readFileSync(config.filePath, 'utf-8');
            return csvParse(content, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
                delimiter: config.delimiter || ',',
            });
        }
        if (config.url) {
            const resp = await axios.get(config.url, { responseType: 'text' });
            return csvParse(resp.data, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
                delimiter: config.delimiter || ',',
            });
        }
        throw new Error('CSV source requires content, filePath, or url');
    }

    private async readJson(config: any): Promise<any[]> {
        if (config.content) {
            return Array.isArray(config.content) ? config.content : [config.content];
        }
        if (config.url) {
            const resp = await axios.get(config.url, { headers: config.headers || {} });
            const data = resp.data;
            if (config.dataPath) {
                const paths = config.dataPath.split('.');
                let result = data;
                for (const p of paths) {
                    if (result && typeof result === 'object') result = result[p];
                    else throw new Error(`Data path '${config.dataPath}' not found in response`);
                }
                return Array.isArray(result) ? result : [result];
            }
            return Array.isArray(data) ? data : [data];
        }
        throw new Error('JSON source requires content or url');
    }

    private async readApi(config: any, ctx: SyncContext): Promise<any[]> {
        const resp = await axios({
            method: config.method || 'GET',
            url: config.url,
            headers: config.headers || {},
            params: config.params || {},
            data: config.body,
            timeout: config.timeout || 30000,
            ...(config.auth ? { auth: config.auth } : {}),
        });

        const data = resp.data;
        if (config.dataPath) {
            const paths = config.dataPath.split('.');
            let result = data;
            for (const p of paths) {
                if (result && typeof result === 'object') result = result[p];
                else throw new Error(`Data path '${config.dataPath}' not found in API response`);
            }
            return Array.isArray(result) ? result : [result];
        }
        return Array.isArray(data) ? data : [data];
    }

    private async readPostgres(config: any, ctx: SyncContext): Promise<any[]> {
        const client = await this.getPgClient(config);
        let query = config.query;
        const params: any[] = [];

        if (!query) {
            query = `SELECT * FROM ${config.table}`;
            if (config.incrementalField && ctx.lastSyncAt) {
                query += ` WHERE ${config.incrementalField} > $1 ORDER BY ${config.incrementalField} ASC`;
                params.push(ctx.lastSyncAt);
            }
            if (config.limit) {
                query += ` LIMIT ${config.limit}`;
            }
        }

        const result = await client.query(query, params);
        return result.rows;
    }

    private async readKafka(config: any, ctx: SyncContext): Promise<any[]> {
        const kafka = this.getKafkaClient(config);
        const consumer = kafka.consumer({ groupId: config.groupId || `data-integration-${Date.now()}` });
        await consumer.connect();
        await consumer.subscribe({ topic: config.topic, fromBeginning: config.fromBeginning || false });

        const messages: any[] = [];
        await consumer.run({
            eachMessage: async ({ message }) => {
                try {
                    const parsed = JSON.parse(message.value!.toString());
                    messages.push(parsed);
                } catch {
                    messages.push({ raw: message.value!.toString() });
                }
            },
        });

        await new Promise(resolve => setTimeout(resolve, config.pollTimeout || 5000));
        await consumer.disconnect();
        return messages;
    }

    private applyMapping(data: any[], mappings: FieldMapping[]): any[] {
        if (!mappings || mappings.length === 0) return data;

        return data.map(record => {
            const mapped: any = {};

            for (const mapping of mappings) {
                let value = this.getNestedValue(record, mapping.source);

                if (value === undefined || value === null) {
                    if (mapping.defaultValue !== undefined) {
                        value = mapping.defaultValue;
                    }
                    continue;
                }

                if (mapping.transform) {
                    value = this.applyTransform(value, record, mapping.transform);
                }

                this.setNestedValue(mapped, mapping.target, value);
            }

            return mapped;
        });
    }

    private applyTransform(value: any, record: any, transform: { type: string; params?: Record<string, any> }): any {
        switch (transform.type) {
            case 'rename':
                return value;

            case 'format': {
                const { template } = transform.params || {};
                if (template) {
                    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
                        const val = this.getNestedValue(record, key);
                        return val !== undefined ? String(val) : '';
                    });
                }
                return String(value);
            }

            case 'concat': {
                const { fields, separator = ' ' } = transform.params || {};
                if (fields && Array.isArray(fields)) {
                    return fields
                        .map(f => this.getNestedValue(record, f))
                        .filter(v => v !== undefined && v !== null)
                        .join(separator);
                }
                return value;
            }

            case 'lookup': {
                const { mapping: lookupMapping, defaultValue } = transform.params || {};
                if (lookupMapping && typeof lookupMapping === 'object') {
                    return lookupMapping[String(value)] ?? defaultValue ?? value;
                }
                return value;
            }

            default:
                return value;
        }
    }

    private validateRecords(data: any[]): { valid: any[]; errors: string[] } {
        const valid: any[] = [];
        const errors: string[] = [];

        for (let i = 0; i < data.length; i++) {
            const record = data[i];
            const recordErrors: string[] = [];

            for (const [key, val] of Object.entries(record)) {
                if (val === undefined) {
                    recordErrors.push(`Field '${key}' is undefined`);
                }
                if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
                    try {
                        JSON.stringify(val);
                    } catch {
                        recordErrors.push(`Field '${key}' contains non-serializable object`);
                    }
                }
            }

            if (recordErrors.length > 0) {
                errors.push(`Record ${i}: ${recordErrors.join('; ')}`);
            } else {
                valid.push(record);
            }
        }

        return { valid, errors };
    }

    private async writeTarget(integration: any, data: any[], ctx: SyncContext): Promise<void> {
        switch (integration.targetType) {
            case 'csv': return this.writeCsv(integration.targetConfig, data);
            case 'json': return this.writeJson(integration.targetConfig, data);
            case 'api': return this.writeApi(integration.targetConfig, data, ctx);
            case 'postgres': return this.writePostgres(integration, integration.targetConfig, data, ctx);
            case 'kafka': return this.writeKafka(integration.targetConfig, data, ctx);
            default: throw new Error(`Unsupported target type: ${integration.targetType}`);
        }
    }

    private async writeCsv(config: any, data: any[]): Promise<void> {
        const output = csvStringify(data, {
            header: true,
            delimiter: config.delimiter || ',',
        });

        if (config.filePath) {
            const fs = require('fs');
            fs.writeFileSync(config.filePath, output, 'utf-8');
        }

        if (config.returnContent) {
            return output as any;
        }
    }

    private async writeJson(config: any, data: any[]): Promise<void> {
        const output = JSON.stringify(config.wrapInArray !== false ? data : data[0], null, config.pretty ? 2 : 0);

        if (config.filePath) {
            const fs = require('fs');
            fs.writeFileSync(config.filePath, output, 'utf-8');
        }

        if (config.returnContent) {
            return output as any;
        }
    }

    private async writeApi(config: any, data: any[], ctx: SyncContext): Promise<void> {
        const batchSize = config.batchSize || 100;

        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const payload = config.wrapInArray !== false ? batch : batch[0];

            try {
                await axios({
                    method: config.method || 'POST',
                    url: config.url,
                    headers: { 'Content-Type': 'application/json', ...(config.headers || {}) },
                    data: payload,
                    timeout: config.timeout || 30000,
                    ...(config.auth ? { auth: config.auth } : {}),
                });
            } catch (e: any) {
                ctx.errors.push(`API write batch ${i / batchSize} failed: ${e.message}`);
                ctx.recordsFailed += batch.length;
            }
        }
    }

    private async writePostgres(integration: any, config: any, data: any[], ctx: SyncContext): Promise<void> {
        const client = await this.getPgClient(config);
        const table = config.table;
        const conflictStrategy = integration.mapping?.conflictStrategy || 'last-write-wins';
        const conflictKey = config.conflictKey || 'id';

        for (const record of data) {
            try {
                if (conflictStrategy === 'skip') {
                    const check = await client.query(`SELECT 1 FROM ${table} WHERE ${conflictKey} = $1`, [record[conflictKey]]);
                    if (check.rows.length > 0) continue;
                }

                if (conflictStrategy === 'manual' && config.requireApproval) {
                    ctx.errors.push(`Record ${record[conflictKey]} requires manual resolution`);
                    ctx.recordsFailed++;
                    continue;
                }

                const keys = Object.keys(record);
                const values = Object.values(record);
                const placeholders = keys.map((_, i) => `$${i + 1}`);
                const updates = keys.map((k, i) => `${k} = $${i + 1}`);

                if (conflictStrategy === 'last-write-wins') {
                    await client.query(
                        `INSERT INTO ${table} (${keys.join(', ')})
                         VALUES (${placeholders.join(', ')})
                         ON CONFLICT (${conflictKey})
                         DO UPDATE SET ${updates.join(', ')}`,
                        values,
                    );
                } else if (conflictStrategy === 'skip' || conflictStrategy === 'manual') {
                    await client.query(
                        `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders.join(', ')})`,
                        values,
                    );
                }
            } catch (e: any) {
                ctx.errors.push(`Postgres write failed for record: ${e.message}`);
                ctx.recordsFailed++;
            }
        }
    }

    private async writeKafka(config: any, data: any[], ctx: SyncContext): Promise<void> {
        const kafka = this.getKafkaClient(config);
        const producer = kafka.producer();
        await producer.connect();

        try {
            const messages = data.map(record => ({
                value: JSON.stringify(record),
                key: record[config.keyField] ? String(record[config.keyField]) : undefined,
            }));

            await producer.send({
                topic: config.topic,
                messages,
            });
        } finally {
            await producer.disconnect();
        }
    }

    async exportToCsv(integrationId: string, format: 'csv' | 'json' = 'csv'): Promise<string> {
        const integration = await this.prisma.integration.findUnique({ where: { id: integrationId } });
        if (!integration) throw new Error('Integration not found');

        const ctx: SyncContext = {
            integration,
            runId: '',
            recordsProcessed: 0,
            recordsFailed: 0,
            errors: [],
        };

        const data = await this.readSource(integration, ctx);
        const transformed = this.applyMapping(data, integration.mapping || []);
        const { valid } = this.validateRecords(transformed);

        if (format === 'csv') {
            return csvStringify(valid, { header: true, delimiter: ',' });
        }
        return JSON.stringify(valid, null, 2);
    }

    private getNestedValue(obj: any, path: string): any {
        const keys = path.split('.');
        let result = obj;
        for (const key of keys) {
            if (result == null || typeof result !== 'object') return undefined;
            result = result[key];
        }
        return result;
    }

    private setNestedValue(obj: any, path: string, value: any): void {
        const keys = path.split('.');
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
    }

    private getKafkaClient(config: any): Kafka {
        const key = (config.brokers || []).join(',') || 'default';
        if (!this.kafkaClients.has(key)) {
            this.kafkaClients.set(key, new Kafka({
                clientId: config.clientId || 'data-integration',
                brokers: config.brokers || ['localhost:9092'],
                ssl: config.ssl || false,
                sasl: config.sasl || undefined,
            }));
        }
        return this.kafkaClients.get(key)!;
    }

    private async getPgClient(config: any): Promise<PgClient> {
        const key = `${config.host}:${config.port || 5432}/${config.database}`;
        if (!this.pgClients.has(key)) {
            const client = new PgClient({
                host: config.host,
                port: config.port || 5432,
                database: config.database,
                user: config.user,
                password: config.password,
                ssl: config.ssl || false,
                connectionTimeoutMillis: 10000,
            });
            await client.connect();
            this.pgClients.set(key, client);
        }
        return this.pgClients.get(key)!;
    }

    private async completeRun(runId: string, ctx: SyncContext) {
        await this.prisma.integrationRun.update({
            where: { id: runId },
            data: {
                status: 'completed',
                completedAt: new Date(),
                recordsProcessed: ctx.recordsProcessed,
                recordsFailed: ctx.recordsFailed,
                log: ctx.errors.length > 0 ? { errors: ctx.errors } : undefined,
            },
        });
    }

    private async failRun(runId: string, error: Error, ctx: SyncContext) {
        await this.prisma.integrationRun.update({
            where: { id: runId },
            data: {
                status: 'failed',
                completedAt: new Date(),
                recordsProcessed: ctx.recordsProcessed,
                recordsFailed: ctx.recordsFailed,
                error: error.message,
                log: { errors: ctx.errors, stack: error.stack },
            },
        });
    }

    async resolveConflict(runId: string, recordId: string, resolution: 'accept-source' | 'accept-target'): Promise<void> {
        const run = await this.prisma.integrationRun.findUnique({ where: { id: runId } });
        if (!run) throw new Error('Run not found');

        const log = (run.log as any) || {};
        const conflicts = log.pendingConflicts || [];
        const conflict = conflicts.find((c: any) => c.recordId === recordId);
        if (!conflict) throw new Error('Conflict not found');

        conflict.resolution = resolution;
        conflict.resolvedAt = new Date();

        if (resolution === 'accept-source') {
            const integration = await this.prisma.integration.findUnique({ where: { id: run.integrationId } });
            if (integration) {
                const ctx: SyncContext = {
                    integration,
                    runId,
                    recordsProcessed: 0,
                    recordsFailed: 0,
                    errors: [],
                };
                await this.writeTarget(integration, [conflict.sourceRecord], ctx);
            }
        }

        await this.prisma.integrationRun.update({
            where: { id: runId },
            data: { log },
        });
    }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async processScheduledIntegrations() {
        const integrations = await this.prisma.integration.findMany({
            where: { enabled: true, schedule: { not: null } },
        });

        for (const integration of integrations) {
            try {
                const run = await this.prisma.integrationRun.create({
                    data: { integrationId: integration.id, status: 'running' },
                });
                await this.execute(integration, run.id);
            } catch (err: any) {
                this.logger.error(`Scheduled integration ${integration.id} failed: ${err.message}`);
            }
        }
    }
}
