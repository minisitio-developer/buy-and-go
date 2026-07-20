import {
    Controller, Get, Post, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { ConnectionsService } from './connections.service';

@Controller('events/:eventId/connections')
@UseGuards(JwtAuthGuard)
export class ConnectionsController {
    constructor(private readonly service: ConnectionsService) {}

    @Post('request')
    async requestConnection(
        @Param('eventId') eventId: string,
        @Body() body: { participantId1: string; participantId2: string; message?: string },
    ) {
        return this.service.requestConnection(eventId, body.participantId1, body.participantId2, body.message);
    }

    @Post(':id/accept')
    async acceptConnection(@Param('id') id: string) {
        return this.service.acceptConnection(id);
    }

    @Post(':id/decline')
    async declineConnection(@Param('id') id: string) {
        return this.service.declineConnection(id);
    }

    @Get()
    async findByEvent(
        @Param('eventId') eventId: string,
        @Query('participantId') participantId?: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.service.findByEvent(eventId, { participantId, page, perPage });
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.service.findById(id);
    }
}
