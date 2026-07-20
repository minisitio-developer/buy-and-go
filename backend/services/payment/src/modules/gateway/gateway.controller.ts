import {
    Controller, Get, Post, Patch,
    Body, Param, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { GatewayService } from './gateway.service';

@Controller('gateways')
@UseGuards(JwtAuthGuard)
export class GatewayController {
    constructor(private readonly service: GatewayService) {}

    @Post()
    async create(@Body() body: {
        organizationId: string;
        gateway: string;
        credentials: Record<string, any>;
        webhookSecret?: string;
    }) {
        return this.service.create(body);
    }

    @Get()
    async findAll(@Param('organizationId') organizationId?: string) {
        return this.service.findAll(organizationId);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() body: { credentials?: Record<string, any>; webhookSecret?: string; active?: boolean },
    ) {
        return this.service.update(id, body);
    }
}
