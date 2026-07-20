import {
    Controller, Get, Post, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { ProximityService } from './proximity.service';

@Controller('events/:eventId/proximity')
@UseGuards(JwtAuthGuard)
export class ProximityController {
    constructor(private readonly service: ProximityService) {}

    @Post('location')
    async recordLocation(
        @Param('eventId') eventId: string,
        @Body() body: { participantId: string; latitude: number; longitude: number; accuracy?: number },
    ) {
        return this.service.recordLocation(eventId, body.participantId, {
            latitude: body.latitude,
            longitude: body.longitude,
            accuracy: body.accuracy,
        });
    }

    @Post(':participantId/depart')
    async markDeparted(
        @Param('eventId') eventId: string,
        @Param('participantId') participantId: string,
    ) {
        return this.service.markDeparted(eventId, participantId);
    }

    @Get('nearby')
    async findNearby(
        @Param('eventId') eventId: string,
        @Query('participantId') participantId: string,
        @Query('radiusKm') radiusKm?: string,
    ) {
        return this.service.findNearby(eventId, participantId, radiusKm ? parseFloat(radiusKm) : undefined);
    }

    @Get('history')
    async getHistory(
        @Param('eventId') eventId: string,
        @Query('participantId') participantId: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.service.getHistory(eventId, participantId, { page, perPage });
    }

    @Get('heatmap')
    async getHeatmap(
        @Param('eventId') eventId: string,
        @Query('since') since?: string,
    ) {
        return this.service.getHeatmap(eventId, since ? new Date(since) : undefined);
    }
}
