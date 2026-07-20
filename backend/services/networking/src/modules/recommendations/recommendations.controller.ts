import {
    Controller, Get, Post, Delete,
    Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { RecommendationsService } from './recommendations.service';

@Controller('events/:eventId/recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
    constructor(private readonly service: RecommendationsService) {}

    @Post('generate')
    async generate(
        @Param('eventId') eventId: string,
        @Body() body: { participantId?: string },
    ) {
        return this.service.generate(eventId, body.participantId);
    }

    @Get()
    async findByEvent(
        @Param('eventId') eventId: string,
        @Query('participantId') participantId: string,
        @Query('type') type?: string,
        @Query('minScore') minScore?: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.service.findByEvent(eventId, {
            participantId,
            type,
            minScore: minScore ? parseFloat(minScore) : undefined,
            page,
            perPage,
        });
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}
