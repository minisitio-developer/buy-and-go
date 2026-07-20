import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { DashboardsService } from './dashboards.service';

@Controller('analytics/dashboards')
@UseGuards(JwtAuthGuard)
export class DashboardsController {
    constructor(private readonly service: DashboardsService) {}

    @Post()
    async create(@Body() body: any) {
        return this.service.create(body);
    }

    @Get()
    async findByOrganization(@Query('organizationId') organizationId: string) {
        return this.service.findByOrganization(organizationId);
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
}
