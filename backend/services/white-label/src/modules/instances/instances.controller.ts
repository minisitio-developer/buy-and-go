import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { InstancesService } from './instances.service';

@Controller('instances')
@UseGuards(JwtAuthGuard)
export class InstancesController {
    constructor(private readonly service: InstancesService) {}

    @Post()
    async create(@Body() body: any) {
        return this.service.create(body);
    }

    @Get()
    async findAll(
        @Query('eventId') eventId?: string,
        @Query('organizationId') organizationId?: string,
    ) {
        if (eventId) return this.service.findByEvent(eventId);
        if (organizationId) return this.service.findByOrganization(organizationId);
        return { data: [] };
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
