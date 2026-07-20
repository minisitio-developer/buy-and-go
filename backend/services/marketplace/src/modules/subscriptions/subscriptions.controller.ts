import {
    Controller, Get, Post, Patch,
    Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
    constructor(private readonly service: SubscriptionsService) {}

    @Post()
    async create(@Body() body: any) {
        return this.service.create(body);
    }

    @Get()
    async findAll(
        @Query('organizationId') organizationId?: string,
        @Query('participantId') participantId?: string,
        @Query('planId') planId?: string,
        @Query('status') status?: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.service.findAll({ organizationId, participantId, planId, status, page, perPage });
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.service.findById(id);
    }

    @Patch(':id/cancel')
    async cancel(@Param('id') id: string) {
        return this.service.cancel(id);
    }

    @Patch(':id/renew')
    async renew(@Param('id') id: string) {
        return this.service.renew(id);
    }
}
