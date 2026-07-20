import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { SyncService } from './sync.service';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
    constructor(private readonly service: SyncService) {}

    @Get('events/:eventId')
    async getSyncData(@Param('eventId') eventId: string) {
        return this.service.getSyncData(eventId);
    }

    @Post('check-ins')
    async syncCheckIns(@Body() body: any) {
        return this.service.syncCheckIns(body);
    }
}
