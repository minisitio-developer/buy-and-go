import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { PrismaService } from '../database/prisma.service';

interface SearchResult {
    hits: any[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
    facets?: Record<string, any>;
    highlights?: Record<string, string[]>;
}

@Injectable()
export class ElasticsearchService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(ElasticsearchService.name);
    private client: Client;
    private fallbackMode = false;

    constructor(private readonly prisma: PrismaService) {}

    async onModuleInit() {
        await this.connect();
    }

    private async connect() {
        const node = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
        const apiKey = process.env.ELASTICSEARCH_API_KEY;

        try {
            this.client = new Client({
                node,
                auth: apiKey ? { apiKey } : undefined,
                requestTimeout: 10000,
            });
            await this.client.ping();
            this.fallbackMode = false;
            this.logger.log(`Connected to Elasticsearch at ${node}`);
        } catch (error) {
            this.logger.warn(`Elasticsearch unavailable at ${node}, using PostgreSQL fallback`);
            this.fallbackMode = true;
        }
    }

    private getIndexName(documentType: string): string {
        return `eventos_${documentType}`;
    }

    async createIndex(documentType: string): Promise<void> {
        const index = this.getIndexName(documentType);

        if (this.fallbackMode) return;

        const exists = await this.client.indices.exists({ index });
        if (!exists) {
            await this.client.indices.create({
                index,
                body: {
                    settings: {
                        analysis: {
                            analyzer: {
                                default: {
                                    type: 'standard',
                                },
                            },
                        },
                    },
                    mappings: {
                        properties: {
                            documentType: { type: 'keyword' },
                            documentId: { type: 'keyword' },
                            content: { type: 'object', enabled: true },
                            createdAt: { type: 'date' },
                            updatedAt: { type: 'date' },
                        },
                    },
                },
            });
            this.logger.log(`Created index: ${index}`);
        }
    }

    async deleteIndex(documentType: string): Promise<void> {
        const index = this.getIndexName(documentType);

        if (this.fallbackMode) {
            await this.prisma.searchIndex.deleteMany({ where: { documentType } });
            return;
        }

        const exists = await this.client.indices.exists({ index });
        if (exists) {
            await this.client.indices.delete({ index });
            this.logger.log(`Deleted index: ${index}`);
        }
    }

    async reindex(sourceType: string, destType: string): Promise<void> {
        const source = this.getIndexName(sourceType);
        const dest = this.getIndexName(destType);

        if (this.fallbackMode) return;

        await this.client.reindex({
            body: {
                source: { index: source },
                dest: { index: dest },
            },
        });
        this.logger.log(`Reindexed ${source} to ${dest}`);
    }

    async index(documentType: string, documentId: string, content: Record<string, any>): Promise<void> {
        const index = this.getIndexName(documentType);

        if (this.fallbackMode) {
            await this.prisma.searchIndex.upsert({
                where: { documentType_documentId: { documentType, documentId } },
                update: { content, name: content.name || content.title || documentId },
                create: {
                    documentType,
                    documentId,
                    content,
                    name: content.name || content.title || documentId,
                },
            });
            return;
        }

        await this.client.index({
            index,
            id: documentId,
            body: {
                documentType,
                documentId,
                content,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            refresh: 'wait_for',
        });
    }

    async update(documentType: string, documentId: string, content: Record<string, any>): Promise<void> {
        const index = this.getIndexName(documentType);

        if (this.fallbackMode) {
            await this.prisma.searchIndex.updateMany({
                where: { documentType, documentId },
                data: { content, updatedAt: new Date() },
            });
            return;
        }

        await this.client.update({
            index,
            id: documentId,
            body: {
                doc: {
                    content,
                    updatedAt: new Date().toISOString(),
                },
            },
        });
    }

    async remove(documentType: string, documentId: string): Promise<void> {
        const index = this.getIndexName(documentType);

        if (this.fallbackMode) {
            await this.prisma.searchIndex.deleteMany({
                where: { documentType, documentId },
            });
            return;
        }

        await this.client.delete({ index, id: documentId }).catch(() => {});
    }

    async search(
        query: string,
        filters?: Record<string, any>,
        page = 1,
        perPage = 20,
    ): Promise<SearchResult> {
        if (this.fallbackMode) {
            return this.fallbackSearch(query, filters, page, perPage);
        }

        const must: any[] = [];
        const filter: any[] = [];

        if (query) {
            must.push({
                multi_match: {
                    query,
                    fields: ['content.name^3', 'content.email^2', 'content.document', 'content.company', 'content.*'],
                    fuzziness: 'AUTO',
                    operator: 'or',
                },
            });
        } else {
            must.push({ match_all: {} });
        }

        if (filters) {
            for (const [key, value] of Object.entries(filters)) {
                if (value !== undefined && value !== null) {
                    filter.push({ term: { [`content.${key}`]: value } });
                }
            }
        }

        const from = (page - 1) * perPage;

        const response = await this.client.search({
            index: `eventos_*`,
            from,
            size: perPage,
            body: {
                query: {
                    bool: {
                        must,
                        filter: filter.length > 0 ? filter : undefined,
                    },
                },
                highlight: {
                    fields: {
                        'content.name': {},
                        'content.email': {},
                        'content.document': {},
                        'content.company': {},
                        'content.description': {},
                    },
                    pre_tags: ['<mark>'],
                    post_tags: ['</mark>'],
                },
                aggs: {
                    document_types: {
                        terms: { field: 'documentType', size: 20 },
                    },
                },
            },
        });

        const hits = response.hits.hits.map((hit: any) => ({
            id: hit._id,
            index: hit._index,
            score: hit._score,
            source: hit._source,
            highlight: hit.highlight,
        }));

        const total = typeof response.hits.total === 'number'
            ? response.hits.total
            : response.hits.total?.value || 0;

        const facets = response.aggregations
            ? { documentTypes: (response.aggregations.document_types as any)?.buckets || [] }
            : undefined;

        const highlights: Record<string, string[]> = {};
        for (const hit of hits) {
            if (hit.highlight) {
                highlights[hit.id] = hit.highlight;
            }
        }

        return {
            hits,
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage),
            facets,
            highlights: Object.keys(highlights).length > 0 ? highlights : undefined,
        };
    }

    private async fallbackSearch(
        query: string,
        filters?: Record<string, any>,
        page = 1,
        perPage = 20,
    ): Promise<SearchResult> {
        const where: any = {};

        if (query) {
            where.OR = [
                { name: { contains: query, mode: 'insensitive' } },
            ];
        }

        if (filters?.documentType) {
            where.documentType = filters.documentType;
        }

        const [data, total] = await Promise.all([
            this.prisma.searchIndex.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { updatedAt: 'desc' },
            }),
            this.prisma.searchIndex.count({ where }),
        ]);

        return {
            hits: data.map((d) => ({
                id: d.id,
                source: { documentType: d.documentType, documentId: d.documentId, content: d.content },
            })),
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage),
        };
    }

    async indexExists(documentType: string): Promise<boolean> {
        if (this.fallbackMode) return true;
        const index = this.getIndexName(documentType);
        return this.client.indices.exists({ index });
    }
}
