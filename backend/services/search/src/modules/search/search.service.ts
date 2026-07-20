import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '../../infra/elasticsearch/elasticsearch.service';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class SearchService {
    private readonly logger = new Logger(SearchService.name);

    constructor(
        private readonly elasticsearch: ElasticsearchService,
        private readonly prisma: PrismaService,
    ) {}

    async search(
        query: string,
        filters?: Record<string, any>,
        page = 1,
        perPage = 20,
    ) {
        return this.elasticsearch.search(query, filters, page, perPage);
    }

    async index(documentType: string, documentId: string, content: Record<string, any>) {
        await this.elasticsearch.createIndex(documentType);
        await this.elasticsearch.index(documentType, documentId, content);
        return { indexed: true, documentType, documentId };
    }

    async update(documentType: string, documentId: string, content: Record<string, any>) {
        await this.elasticsearch.update(documentType, documentId, content);
        return { updated: true, documentType, documentId };
    }

    async remove(documentType: string, documentId: string) {
        await this.elasticsearch.remove(documentType, documentId);
        return { removed: true, documentType, documentId };
    }

    async rebuild(documentType: string) {
        await this.elasticsearch.deleteIndex(documentType);
        await this.elasticsearch.createIndex(documentType);

        const documents = await this.prisma.searchIndex.findMany({
            where: { documentType },
        });

        for (const doc of documents) {
            await this.elasticsearch.index(documentType, doc.documentId, doc.content as Record<string, any>);
        }

        return { rebuilt: true, documentType, totalIndexed: documents.length };
    }
}
