import {
    Controller, Get, Post, Patch,
    Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { OrdersService } from './orders.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private readonly service: OrdersService) {}

    @Post('orders')
    async create(@Body() body: any) {
        return this.service.create(body);
    }

    @Get('buyers/:buyerId/orders')
    async findByBuyer(
        @Param('buyerId') buyerId: string,
        @Query('status') status?: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.service.findByBuyer(buyerId, { status, page, perPage });
    }

    @Get('organizations/:organizationId/orders')
    async findByOrganization(
        @Param('organizationId') organizationId: string,
        @Query('status') status?: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.service.findByOrganization(organizationId, { status, page, perPage });
    }

    @Get('orders/:id')
    async findById(@Param('id') id: string) {
        return this.service.findById(id);
    }

    @Patch('orders/:id/status')
    async updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.service.updateStatus(id, status);
    }
}
