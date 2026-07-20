import {
    Controller, Get, Post, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { AuditService } from './audit.service';

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
    constructor(private readonly service: AuditService) {}

    @Post()
    async log(@Body() body: any) {
        return this.service.log(body);
    }

    @Get()
    async query(
        @Query('organizationId') organizationId?: string,
        @Query('userId') userId?: string,
        @Query('eventType') eventType?: string,
        @Query('resource') resource?: string,
        @Query('resourceId') resourceId?: string,
        @Query('action') action?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.service.query({
            organizationId, userId, eventType, resource, resourceId,
            action, startDate, endDate, page, perPage,
        });
    }

    @Get('stats')
    async stats() {
        return this.service.getRetentionStats();
    }

    @Delete('retention')
    async applyRetention(@Query('days') days: string) {
        const retentionDays = parseInt(days, 10) || 90;
        return this.service.applyRetentionPolicy(retentionDays);
    }
}
