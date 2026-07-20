import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser } from '@eventos-ai/auth';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private readonly service: OrdersService) {}

    @Post()
    async create(@Body() body: any) {
        return this.service.create(body);
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.service.findById(id);
    }

    @Get()
    async findByEvent(
        @Query('eventId') eventId: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.service.findByEvent(eventId, page, perPage);
    }

    @Post(':id/confirm')
    async confirmPayment(
        @Param('id') id: string,
        @Body() body: { paymentMethod: string; paymentId: string },
    ) {
        return this.service.confirmPayment(id, body.paymentMethod, body.paymentId);
    }

    @Post(':id/refund')
    async refund(@Param('id') id: string) {
        return this.service.refund(id);
    }
}
