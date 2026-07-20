import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { AttendeesService } from './attendees.service';

@Controller('events/:eventId/attendees')
@UseGuards(JwtAuthGuard)
export class AttendeesController {
    constructor(private readonly service: AttendeesService) {}

    @Post()
    async create(@Param('eventId') eventId: string, @Body() body: any) {
        return this.service.create({ ...body, eventId });
    }

    @Get()
    async findByEvent(
        @Param('eventId') eventId: string,
        @Query('category') category?: string,
        @Query('search') search?: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.service.findByEvent(eventId, { category, search, page, perPage });
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.service.findById(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        return this.service.update(id, body);
    }

    @Post('batch')
    async batchImport(@Param('eventId') eventId: string, @Body() body: any) {
        return this.service.batchImport(eventId, body.organizationId, body.attendees);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}
