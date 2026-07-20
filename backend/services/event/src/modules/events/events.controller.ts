import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, CurrentUser } from '@eventos-ai/auth';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
    constructor(private readonly eventsService: EventsService) {}

    @Post()
    async create(@Body() dto: CreateEventDto, @CurrentUser() user: { sub: string }) {
        return this.eventsService.create({
            ...dto,
            createdBy: user.sub,
        });
    }

    @Get()
    async findAll(
        @Query('organizationId') organizationId?: string,
        @Query('status') status?: string,
        @Query('city') city?: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.eventsService.findAll({ organizationId, status, city, page, perPage });
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.eventsService.findById(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
        return this.eventsService.update(id, dto);
    }

    @Post(':id/publish')
    async publish(@Param('id') id: string) {
        return this.eventsService.publish(id);
    }

    @Post(':id/cancel')
    async cancel(@Param('id') id: string) {
        return this.eventsService.cancel(id);
    }

    @Post(':id/duplicate')
    async duplicate(@Param('id') id: string) {
        return this.eventsService.duplicate(id);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.eventsService.remove(id);
    }
}
