import {
    Controller, Get, Post, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { MetricsService } from './metrics.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class MetricsController {
    constructor(private readonly service: MetricsService) {}

    @Post('metrics')
    async create(@Body() body: any) {
        return this.service.create(body);
    }

    @Get('metrics/:sponsorId')
    async findBySponsor(
        @Param('sponsorId') sponsorId: string,
        @Query('days') days?: number,
    ) {
        return this.service.findBySponsor(sponsorId, { days });
    }

    @Get('metrics/:sponsorId/roi')
    async getRoi(@Param('sponsorId') sponsorId: string) {
        return this.service.getRoi(sponsorId);
    }
}
