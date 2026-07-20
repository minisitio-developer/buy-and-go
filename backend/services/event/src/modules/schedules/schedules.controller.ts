import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { SchedulesService } from './schedules.service';

@Controller('events/:eventId/schedules')
@UseGuards(JwtAuthGuard)
export class SchedulesController {
    constructor(private readonly schedulesService: SchedulesService) {}

    @Post()
    async create(@Param('eventId') eventId: string, @Body() body: any) {
        return this.schedulesService.create(eventId, body);
    }

    @Get()
    async findByEvent(@Param('eventId') eventId: string) {
        return this.schedulesService.findByEvent(eventId);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        return this.schedulesService.update(id, body);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.schedulesService.remove(id);
    }
}
