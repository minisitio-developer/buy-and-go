import {
    Controller, Get, Post, Body, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { MetricsService } from './metrics.service';

@Controller('analytics/metrics')
@UseGuards(JwtAuthGuard)
export class MetricsController {
    constructor(private readonly service: MetricsService) {}

    @Post()
    async record(@Body() body: any) {
        return this.service.record(body);
    }

    @Get()
    async query(
        @Query('metricKey') metricKey: string,
        @Query('organizationId') organizationId?: string,
        @Query('eventId') eventId?: string,
        @Query('aggregation') aggregation?: string,
        @Query('period') period?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('groupBy') groupBy?: string,
    ) {
        return this.service.query({
            metricKey,
            organizationId,
            eventId,
            aggregation: aggregation as any,
            period,
            startDate,
            endDate,
            groupBy,
        });
    }
}
