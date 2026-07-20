import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { IntegrationsService } from './integrations.service';

@Controller('organizations/:organizationId/integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
    constructor(private readonly service: IntegrationsService) {}

    @Post()
    async create(@Param('organizationId') organizationId: string, @Body() body: any) {
        return this.service.create({ ...body, organizationId });
    }

    @Get()
    async findAll(
        @Param('organizationId') organizationId: string,
        @Query('type') type?: string,
        @Query('enabled') enabled?: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.service.findAll(organizationId, {
            type,
            enabled: enabled !== undefined ? enabled === 'true' : undefined,
            page,
            perPage,
        });
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.service.findById(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        return this.service.update(id, body);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.service.remove(id);
    }

    @Post('test-connection')
    async testConnection(@Body() body: any) {
        return this.service.testConnection(body);
    }
}
