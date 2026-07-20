import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { LotsService } from './lots.service';

@Controller('ticket-types/:ticketTypeId/lots')
@UseGuards(JwtAuthGuard)
export class LotsController {
    constructor(private readonly service: LotsService) {}

    @Post()
    async create(@Param('ticketTypeId') ticketTypeId: string, @Body() body: any) {
        return this.service.create(ticketTypeId, body);
    }

    @Get()
    async findByTicketType(@Param('ticketTypeId') ticketTypeId: string) {
        return this.service.findByTicketType(ticketTypeId);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        return this.service.update(id, body);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}
