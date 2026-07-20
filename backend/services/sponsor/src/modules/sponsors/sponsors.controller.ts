import {
    Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { SponsorsService } from './sponsors.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class SponsorsController {
    constructor(private readonly service: SponsorsService) {}

    @Post('sponsors')
    async create(@Body() body: any) {
        return this.service.create(body);
    }

    @Get('sponsors')
    async findAll(
        @Query('eventId') eventId?: string,
        @Query('tier') tier?: string,
        @Query('status') status?: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.service.findAll({ eventId, tier, status, page, perPage });
    }

    @Get('sponsors/:id')
    async findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Patch('sponsors/:id')
    async update(@Param('id') id: string, @Body() body: any) {
        return this.service.update(id, body);
    }

    @Delete('sponsors/:id')
    async remove(@Param('id') id: string) {
        return this.service.remove(id);
    }

    @Get('events/:eventId/sponsors')
    async findByEvent(
        @Param('eventId') eventId: string,
        @Query('tier') tier?: string,
    ) {
        return this.service.findByEvent(eventId, { tier });
    }
}
