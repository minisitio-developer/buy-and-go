import { Controller, Post, Param, Req, Headers, Query, Body } from '@nestjs/common';
import { Request } from 'express';
import { TriggersService } from './triggers.service';
import { PrismaService } from '../../infra/database/prisma.service';

@Controller('webhooks')
export class WebhookController {
    constructor(
        private readonly triggers: TriggersService,
        private readonly prisma: PrismaService,
    ) {}

    @Post(':webhookId')
    async handleWebhook(
        @Param('webhookId') webhookId: string,
        @Headers() headers: any,
        @Body() body: any,
        @Query() query: any,
    ) {
        const result = await this.triggers.executeFromWebhook(webhookId, headers, body, query);
        return result;
    }
}
