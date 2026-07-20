import {
    Controller, Get, Post, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly service: NotificationsService) {}

    @Post('send')
    async send(@Body() body: any) {
        return this.service.send(body);
    }

    @Get()
    async findAll(
        @Query('organizationId') organizationId: string,
        @Query('eventId') eventId?: string,
        @Query('participantId') participantId?: string,
        @Query('status') status?: string,
        @Query('type') type?: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.service.findAll({ organizationId, eventId, participantId, status, type, page, perPage });
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.service.findById(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        return this.service.update(id, body);
    }

    @Post(':id/resend')
    async resend(@Param('id') id: string) {
        return this.service.resend(id);
    }
}
