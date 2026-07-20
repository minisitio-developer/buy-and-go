import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { DealsService } from './deals.service';

@Controller('crm/deals')
@UseGuards(JwtAuthGuard)
export class DealsController {
    constructor(private readonly service: DealsService) {}

    @Post()
    async create(@Body() body: any) { return this.service.create(body); }

    @Get()
    async findAll(
        @Query('organizationId') orgId: string,
        @Query('pipelineId') pipelineId?: string,
        @Query('stageId') stageId?: string,
        @Query('ownerId') ownerId?: string,
    ) { return this.service.findAll(orgId, { pipelineId, stageId, ownerId }); }

    @Get(':id')
    async findById(@Param('id') id: string) { return this.service.findById(id); }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

    @Post(':id/move')
    async move(@Param('id') id: string, @Body() body: { stageId: string }) { return this.service.moveToStage(id, body.stageId); }

    @Post(':id/close')
    async close(@Param('id') id: string, @Body() body: any) { return this.service.close(id, body.won, body.lostReason); }

    @Delete(':id')
    async remove(@Param('id') id: string) { return this.service.remove(id); }
}
