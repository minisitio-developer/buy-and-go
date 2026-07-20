import {
    Controller, Get, Post, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { SyncEngineService } from './sync-engine.service';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
    constructor(private readonly engine: SyncEngineService) {}

    @Get('integrations/:integrationId/export')
    async exportData(
        @Param('integrationId') integrationId: string,
        @Query('format') format?: string,
    ) {
        return this.engine.exportToCsv(integrationId, (format as 'csv' | 'json') || 'csv');
    }

    @Post('runs/:runId/resolve-conflict')
    async resolveConflict(
        @Param('runId') runId: string,
        @Body() body: { recordId: string; resolution: 'accept-source' | 'accept-target' },
    ) {
        return this.engine.resolveConflict(runId, body.recordId, body.resolution);
    }
}
