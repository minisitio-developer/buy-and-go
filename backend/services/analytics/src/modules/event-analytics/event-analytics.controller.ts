import {
    Controller, Get, Post, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { EventAnalyticsService } from './event-analytics.service';

@Controller('analytics/events')
@UseGuards(JwtAuthGuard)
export class EventAnalyticsController {
    constructor(private readonly service: EventAnalyticsService) {}

    @Get(':eventId')
    async getEventAnalytics(@Param('eventId') eventId: string) {
        return this.service.getByEvent(eventId);
    }

    @Get(':eventId/timeline')
    async getTimeline(
        @Param('eventId') eventId: string,
        @Query('period') period?: string,
    ) {
        return this.service.getTimeline(eventId, period || 'hourly');
    }

    @Post(':eventId/compute')
    async compute(@Param('eventId') eventId: string) {
        return this.service.computeFullAnalytics(eventId);
    }

    @Post('compute/all')
    async computeAll() {
        return this.service.computeAllEvents();
    }
}
