import {
    Controller, Get, Post, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { PreferencesService } from './preferences.service';

@Controller('preferences')
@UseGuards(JwtAuthGuard)
export class PreferencesController {
    constructor(private readonly service: PreferencesService) {}

    @Post()
    async create(@Body() body: any) {
        return this.service.create(body);
    }

    @Get()
    async findAll(
        @Query('organizationId') organizationId: string,
        @Query('participantId') participantId?: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        if (participantId) {
            return this.service.findByParticipant(organizationId, participantId);
        }
        return this.service.findAll({ organizationId, page, perPage });
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.service.findById(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        return this.service.update(id, body);
    }
}
