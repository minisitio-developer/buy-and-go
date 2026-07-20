import {
    Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { ConfigService, ConfigScope } from './config.service';

@Controller('config')
@UseGuards(JwtAuthGuard)
export class ConfigController {
    constructor(private readonly service: ConfigService) {}

    @Get()
    async findAll(
        @Query('scope') scope?: ConfigScope,
        @Query('scopeId') scopeId?: string,
    ) {
        return this.service.findAll(scope, scopeId);
    }

    @Get(':key')
    async findByKey(
        @Param('key') key: string,
        @Query('scope') scope: ConfigScope = 'global',
        @Query('scopeId') scopeId?: string,
    ) {
        return this.service.findByKey(key, scope, scopeId);
    }

    @Get(':key/value')
    async getValue(
        @Param('key') key: string,
        @Query('scope') scope: ConfigScope = 'global',
        @Query('scopeId') scopeId?: string,
        @Query('defaultValue') defaultValue?: string,
    ) {
        const parsed = defaultValue ? JSON.parse(defaultValue) : undefined;
        return { key, value: await this.service.getValue(key, scope, scopeId, parsed) };
    }

    @Post()
    async create(@Body() body: any) {
        return this.service.create(body);
    }

    @Put(':key')
    async update(
        @Param('key') key: string,
        @Body() body: any,
        @Query('scope') scope: ConfigScope = 'global',
        @Query('scopeId') scopeId?: string,
    ) {
        return this.service.update(key, body, scope, scopeId);
    }

    @Delete(':key')
    async delete(
        @Param('key') key: string,
        @Query('scope') scope: ConfigScope = 'global',
        @Query('scopeId') scopeId?: string,
    ) {
        await this.service.delete(key, scope, scopeId);
        return { deleted: true };
    }
}
