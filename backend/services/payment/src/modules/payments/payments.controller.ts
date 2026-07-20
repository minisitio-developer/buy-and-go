import {
    Controller, Get, Post,
    Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
    constructor(private readonly service: PaymentsService) {}

    @Post()
    async create(@Body() body: {
        organizationId: string;
        orderId?: string;
        eventId: string;
        userId: string;
        amount: number;
        currency?: string;
        method: string;
        installments?: number;
    }) {
        return this.service.create(body);
    }

    @Get()
    async findAll(
        @Query('eventId') eventId?: string,
        @Query('status') status?: string,
        @Query('method') method?: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.service.findAll({ eventId, status, method, page, perPage });
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.service.findById(id);
    }

    @Post(':id/refund')
    async refund(
        @Param('id') id: string,
        @Body() body: { amount?: number; reason?: string; initiatedBy?: string; approvedBy?: string },
    ) {
        return this.service.refund(id, body);
    }

    @Post(':id/capture')
    async capture(@Param('id') id: string) {
        return this.service.capture(id);
    }
}
