import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { ConnectorsService } from './connectors.service';

@Controller('organizations/:organizationId/connectors')
@UseGuards(JwtAuthGuard)
export class ConnectorsController {
    constructor(private readonly service: ConnectorsService) {}

    @Post()
    async create(@Param('organizationId') organizationId: string, @Body() body: any) {
        return this.service.create({ ...body, organizationId });
    }

    @Get()
    async findAll(
        @Param('organizationId') organizationId: string,
        @Query('type') type?: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.service.findAll(organizationId, { type, page, perPage });
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
