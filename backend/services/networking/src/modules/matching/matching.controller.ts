import {
    Controller, Get, Post, Patch,
    Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { MatchingService } from './matching.service';

@Controller('events/:eventId/matches')
@UseGuards(JwtAuthGuard)
export class MatchingController {
    constructor(private readonly service: MatchingService) {}

    @Post('compute')
    async computeMatches(
        @Param('eventId') eventId: string,
        @Body() body: { participantId?: string },
    ) {
        return this.service.computeMatches(eventId, body.participantId);
    }

    @Get()
    async findByEvent(
        @Param('eventId') eventId: string,
        @Query('participantId') participantId?: string,
        @Query('status') status?: string,
        @Query('minScore') minScore?: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.service.findByEvent(eventId, {
            participantId,
            status,
            minScore: minScore ? parseFloat(minScore) : undefined,
            page,
            perPage,
        });
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.service.findById(id);
    }

    @Post('manual')
    async createManualMatch(
        @Param('eventId') eventId: string,
        @Body() body: { participantId1: string; participantId2: string; score?: number },
    ) {
        return this.service.createManualMatch(eventId, body.participantId1, body.participantId2, body.score);
    }

    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body() body: { status: string },
    ) {
        return this.service.updateStatus(id, body.status);
    }
}
