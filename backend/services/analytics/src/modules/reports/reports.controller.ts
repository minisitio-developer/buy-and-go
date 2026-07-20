import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { ReportsService } from './reports.service';

@Controller('analytics/reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
    constructor(private readonly service: ReportsService) {}

    @Post()
    async create(@Body() body: any) {
        return this.service.create(body);
    }

    @Get()
    async findByOrganization(@Query('organizationId') organizationId: string, @Query('type') type?: string) {
        return this.service.findByOrganization(organizationId, type);
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

    @Post(':id/execute')
    async execute(@Param('id') id: string, @Body() body: any) {
        return this.service.execute(id, body?.filters);
    }
}
