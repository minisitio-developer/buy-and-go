import {
    Controller, Get, Post, Body, Param, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { AiNetworkingService } from './ai-networking.service';

@Controller('events/:eventId/ai-networking')
@UseGuards(JwtAuthGuard)
export class AiNetworkingController {
    constructor(private readonly service: AiNetworkingService) {}

    @Post('analyze-profile')
    async analyzeProfile(
        @Param('eventId') eventId: string,
        @Body() body: { participantId: string },
    ) {
        return this.service.analyzeProfile(eventId, body.participantId);
    }

    @Post('smart-match')
    async smartMatch(
        @Param('eventId') eventId: string,
        @Body() body: { participantId: string; limit?: number },
    ) {
        return this.service.smartMatch(eventId, body.participantId, body.limit);
    }

    @Post('icebreaker')
    async generateIcebreaker(
        @Param('eventId') eventId: string,
        @Body() body: { participantId: string; targetId: string },
    ) {
        return this.service.generateIcebreaker(eventId, body.participantId, body.targetId);
    }

    @Post('conversation-starter')
    async generateConversationStarters(
        @Param('eventId') eventId: string,
        @Body() body: { participantId: string },
    ) {
        return this.service.generateConversationStarters(eventId, body.participantId);
    }

    @Get('insights/:participantId')
    async getInsights(
        @Param('eventId') eventId: string,
        @Param('participantId') participantId: string,
    ) {
        return this.service.getInsights(eventId, participantId);
    }
}
