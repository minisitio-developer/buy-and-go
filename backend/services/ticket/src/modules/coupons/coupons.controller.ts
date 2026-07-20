import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { CouponsService } from './coupons.service';

@Controller('coupons')
@UseGuards(JwtAuthGuard)
export class CouponsController {
    constructor(private readonly service: CouponsService) {}

    @Post()
    async create(@Body() body: any) {
        return this.service.create(body);
    }

    @Post('validate')
    async validate(@Body() body: { code: string; eventId: string; total: number }) {
        return this.service.validate(body.code, body.eventId, body.total);
    }

    @Get('event/:eventId')
    async findByEvent(@Param('eventId') eventId: string) {
        return this.service.findByEvent(eventId);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}
