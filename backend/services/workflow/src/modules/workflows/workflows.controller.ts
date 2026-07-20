import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { WorkflowsService } from './workflows.service';

@Controller('organizations/:organizationId/workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowsController {
    constructor(private readonly service: WorkflowsService) {}

    @Post()
    async create(@Param('organizationId') organizationId: string, @Body() body: any) {
        return this.service.create({ ...body, organizationId });
    }

    @Get()
    async findByOrganization(
        @Param('organizationId') organizationId: string,
        @Query('trigger') trigger?: string,
        @Query('enabled') enabled?: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.service.findByOrganization(organizationId, { trigger, enabled, page, perPage });
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

    @Post(':id/steps')
    async addStep(@Param('id') id: string, @Body() body: any) {
        return this.service.addStep(id, body);
    }

    @Patch(':id/steps/:stepId')
    async updateStep(@Param('stepId') stepId: string, @Body() body: any) {
        return this.service.updateStep(stepId, body);
    }

    @Delete(':id/steps/:stepId')
    async removeStep(@Param('stepId') stepId: string) {
        return this.service.removeStep(stepId);
    }

    @Post(':id/toggle')
    async toggle(@Param('id') id: string) {
        return this.service.toggle(id);
    }
}
