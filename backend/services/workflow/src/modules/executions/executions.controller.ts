import {
    Controller, Get, Post, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { ExecutionsService } from './executions.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class ExecutionsController {
    constructor(private readonly service: ExecutionsService) {}

    @Post('workflows/:workflowId/execute')
    async execute(
        @Param('workflowId') workflowId: string,
        @Body() body: any,
    ) {
        return this.service.execute(workflowId, body?.payload);
    }

    @Get('organizations/:organizationId/workflows/:workflowId/executions')
    async findByWorkflow(
        @Param('workflowId') workflowId: string,
        @Query('status') status?: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.service.findByWorkflow(workflowId, { status, page, perPage });
    }

    @Get('organizations/:organizationId/executions')
    async findByOrganization(
        @Param('organizationId') organizationId: string,
        @Query('status') status?: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.service.findByOrganization(organizationId, { status, page, perPage });
    }

    @Get('executions/:id')
    async findById(@Param('id') id: string) {
        return this.service.findById(id);
    }
}
