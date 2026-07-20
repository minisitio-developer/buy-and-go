import {
    Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { FeatureFlagsService } from './feature-flags.service';

@Controller('feature-flags')
@UseGuards(JwtAuthGuard)
export class FeatureFlagsController {
    constructor(private readonly service: FeatureFlagsService) {}

    @Get()
    async findAll() {
        return this.service.findAll();
    }

    @Get(':key')
    async findByKey(@Param('key') key: string) {
        return this.service.findByKey(key);
    }

    @Get(':key/evaluate')
    async evaluate(
        @Param('key') key: string,
        @Query('orgId') orgId?: string,
        @Query('userId') userId?: string,
    ) {
        return this.service.evaluate(key, { orgId, userId });
    }

    @Post()
    async create(@Body() body: any) {
        return this.service.create(body);
    }

    @Put(':key')
    async update(@Param('key') key: string, @Body() body: any) {
        return this.service.update(key, body);
    }

    @Delete(':key')
    async delete(@Param('key') key: string) {
        await this.service.delete(key);
        return { deleted: true };
    }
}
