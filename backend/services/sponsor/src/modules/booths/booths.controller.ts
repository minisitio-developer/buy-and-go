import {
    Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { BoothsService } from './booths.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class BoothsController {
    constructor(private readonly service: BoothsService) {}

    @Post('booths')
    async create(@Body() body: any) {
        return this.service.create(body);
    }

    @Get('booths')
    async findAll(
        @Query('eventId') eventId?: string,
        @Query('sponsorId') sponsorId?: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.service.findAll({ eventId, sponsorId, page, perPage });
    }

    @Get('booths/:id')
    async findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Patch('booths/:id')
    async update(@Param('id') id: string, @Body() body: any) {
        return this.service.update(id, body);
    }

    @Delete('booths/:id')
    async remove(@Param('id') id: string) {
        return this.service.remove(id);
    }

    @Get('events/:eventId/booths')
    async findByEvent(@Param('eventId') eventId: string) {
        return this.service.findByEvent(eventId);
    }

    @Post('booths/:id/checkin')
    async trackCheckin(@Param('id') id: string) {
        return this.service.trackCheckin(id);
    }
}
