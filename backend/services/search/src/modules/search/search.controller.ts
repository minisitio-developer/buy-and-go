import {
    Controller, Get, Post, Put, Delete,
    Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { SearchService } from './search.service';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
    constructor(private readonly service: SearchService) {}

    @Get()
    async search(
        @Query('q') query: string,
        @Query('documentType') documentType?: string,
        @Query('eventId') eventId?: string,
        @Query('organizationId') organizationId?: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        const filters: Record<string, any> = {};
        if (documentType) filters.documentType = documentType;
        if (eventId) filters.eventId = eventId;
        if (organizationId) filters.organizationId = organizationId;

        return this.service.search(query, filters, page, perPage);
    }

    @Post('index')
    async index(
        @Body('documentType') documentType: string,
        @Body('documentId') documentId: string,
        @Body('content') content: Record<string, any>,
    ) {
        return this.service.index(documentType, documentId, content);
    }

    @Put('index')
    async update(
        @Body('documentType') documentType: string,
        @Body('documentId') documentId: string,
        @Body('content') content: Record<string, any>,
    ) {
        return this.service.update(documentType, documentId, content);
    }

    @Delete('index')
    async remove(
        @Body('documentType') documentType: string,
        @Body('documentId') documentId: string,
    ) {
        return this.service.remove(documentType, documentId);
    }

    @Post('rebuild')
    async rebuild(@Body('documentType') documentType: string) {
        return this.service.rebuild(documentType);
    }
}
