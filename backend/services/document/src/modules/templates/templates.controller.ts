import {
    Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { TemplatesService } from './templates.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class TemplatesController {
    constructor(private readonly service: TemplatesService) {}

    @Post('templates')
    async create(@Body() body: any) {
        return this.service.create(body);
    }

    @Get('templates')
    async findAll(@Query('organizationId') organizationId: string, @Query('type') type?: string) {
        return this.service.findAll(organizationId, type);
    }

    @Get('templates/:id')
    async findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Put('templates/:id')
    async update(@Param('id') id: string, @Body() body: any) {
        return this.service.update(id, body);
    }

    @Delete('templates/:id')
    async remove(@Param('id') id: string) {
        return this.service.remove(id);
    }

    @Post('templates/:id/preview')
    async preview(@Param('id') id: string, @Body() body: any) {
        return this.service.preview(id, body.variables || {});
    }

    @Post('templates/extract-variables')
    async extractVariables(@Body('content') content: string) {
        return this.service.extractVariables(content);
    }
}
