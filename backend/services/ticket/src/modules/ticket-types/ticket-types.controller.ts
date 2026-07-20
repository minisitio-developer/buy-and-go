import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { TicketTypesService } from './ticket-types.service';

@Controller('events/:eventId/ticket-types')
@UseGuards(JwtAuthGuard)
export class TicketTypesController {
    constructor(private readonly service: TicketTypesService) {}

    @Post()
    async create(@Param('eventId') eventId: string, @Body() body: any) {
        return this.service.create(eventId, body);
    }

    @Get()
    async findByEvent(@Param('eventId') eventId: string) {
        return this.service.findByEvent(eventId);
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.service.findById(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        return this.service.update(id, body);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.service.remove(id);
    }

    @Get(':id/sold')
    async getSoldCount(@Param('id') id: string) {
        const count = await this.service.getSoldCount(id);
        return { sold: count };
    }
}
