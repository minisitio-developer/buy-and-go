import {
    Controller, Get, Post, Put, Body, Param, Query, UseGuards, Res, StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { DocumentsService } from './documents.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class DocumentsController {
    constructor(private readonly service: DocumentsService) {}

    @Post('documents')
    async create(@Body() body: any) {
        return this.service.create(body);
    }

    @Get('documents')
    async findAll(
        @Query('organizationId') organizationId: string,
        @Query('eventId') eventId?: string,
        @Query('type') type?: string,
        @Query('status') status?: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.service.findAll(organizationId, { eventId, type, status, page, perPage });
    }

    @Get('documents/:id')
    async findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post('documents/:id/generate')
    async generate(@Param('id') id: string) {
        return this.service.generate(id);
    }

    @Get('documents/:id/download')
    async download(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
        const result = await this.service.download(id);

        res.set({
            'Content-Type': result.mimeType,
            'Content-Disposition': `attachment; filename="${result.filename}"`,
            'Content-Length': result.data.length.toString(),
        });

        return new StreamableFile(result.data);
    }

    @Get('events/:eventId/documents/stats')
    async getStats(@Param('eventId') eventId: string) {
        return this.service.getStats(eventId);
    }

    @Post('documents/batch-generate')
    async batchGenerate(@Body() body: { organizationId: string; eventId: string; type: string; participantIds: string[] }) {
        return this.service.batchGenerate(body);
    }
}
