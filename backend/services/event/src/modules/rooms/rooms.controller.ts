import {
    Controller, Get, Post, Delete,
    Body, Param, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { RoomsService } from './rooms.service';

@Controller('events/:eventId/rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) {}

    @Post()
    async create(@Param('eventId') eventId: string, @Body() body: any) {
        return this.roomsService.create(eventId, body);
    }

    @Get()
    async findByEvent(@Param('eventId') eventId: string) {
        return this.roomsService.findByEvent(eventId);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.roomsService.remove(id);
    }
}
