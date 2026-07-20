import {
    Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { LocalizationService } from './localization.service';

@Controller('localization')
@UseGuards(JwtAuthGuard)
export class LocalizationController {
    constructor(private readonly service: LocalizationService) {}

    @Get()
    async findAll(
        @Query('locale') locale?: string,
        @Query('module') module?: string,
    ) {
        return this.service.findAll(locale, module);
    }

    @Get('bundle/:locale')
    async getBundle(
        @Param('locale') locale: string,
        @Query('module') module?: string,
    ) {
        return this.service.getLocaleBundle(locale, module);
    }

    @Get(':locale/:key')
    async getTranslation(
        @Param('locale') locale: string,
        @Param('key') key: string,
        @Query('defaultValue') defaultValue?: string,
    ) {
        return { locale, key, value: await this.service.getTranslation(locale, key, defaultValue) };
    }

    @Post()
    async create(@Body() body: { locale: string; key: string; value: string; module?: string }) {
        return this.service.upsert(body.locale, body.key, body.value, body.module);
    }

    @Post('bulk')
    async bulkCreate(@Body() body: { locale: string; key: string; value: string; module?: string }[]) {
        return this.service.bulkUpsert(body);
    }

    @Put(':locale/:key')
    async update(
        @Param('locale') locale: string,
        @Param('key') key: string,
        @Body() body: { value: string; module?: string },
    ) {
        return this.service.upsert(locale, key, body.value, body.module);
    }

    @Delete(':locale/:key')
    async delete(@Param('locale') locale: string, @Param('key') key: string) {
        await this.service.delete(locale, key);
        return { deleted: true };
    }
}
