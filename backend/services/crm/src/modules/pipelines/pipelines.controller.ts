import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { PipelinesService } from './pipelines.service';

@Controller('crm/pipelines')
@UseGuards(JwtAuthGuard)
export class PipelinesController {
    constructor(private readonly service: PipelinesService) {}

    @Post()
    async create(@Body() body: any) { return this.service.create(body); }

    @Get()
    async findAll(@Body() body: any) { return this.service.findAll(body.organizationId); }

    @Get(':id')
    async findById(@Param('id') id: string) { return this.service.findById(id); }

    @Post(':id/stages')
    async addStage(@Param('id') id: string, @Body() body: any) { return this.service.addStage(id, body); }

    @Patch('stages/:id')
    async updateStage(@Param('id') id: string, @Body() body: any) { return this.service.updateStage(id, body); }

    @Delete('stages/:id')
    async removeStage(@Param('id') id: string) { return this.service.removeStage(id); }
}
