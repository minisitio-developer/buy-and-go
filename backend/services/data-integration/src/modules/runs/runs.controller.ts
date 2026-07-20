import {
    Controller, Get, Post, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { RunsService } from './runs.service';

@Controller('integrations/:integrationId/runs')
@UseGuards(JwtAuthGuard)
export class RunsController {
    constructor(private readonly service: RunsService) {}

    @Post()
    async execute(@Param('integrationId') integrationId: string) {
        return this.service.execute(integrationId);
    }

    @Get()
    async findByIntegration(
        @Param('integrationId') integrationId: string,
        @Query('status') status?: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.service.findByIntegration(integrationId, { status, page, perPage });
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.service.findById(id);
    }

    @Post(':id/retry')
    async retry(@Param('id') id: string) {
        return this.service.retryFailed(id);
    }

    @Post(':id/cancel')
    async cancel(@Param('id') id: string) {
        return this.service.cancel(id);
    }
}
