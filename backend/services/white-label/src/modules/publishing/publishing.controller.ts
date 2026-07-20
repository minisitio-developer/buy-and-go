import {
    Controller, Get, Patch, Param, Body, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { PublishingService } from './publishing.service';

@Controller('publishing')
@UseGuards(JwtAuthGuard)
export class PublishingController {
    constructor(private readonly service: PublishingService) {}

    @Patch('instances/:instanceId/stores')
    async updateStoreUrls(
        @Param('instanceId') instanceId: string,
        @Body() body: { appStoreUrl?: string; playStoreUrl?: string },
    ) {
        return this.service.updateStoreUrls(instanceId, body);
    }

    @Get('instances/:instanceId')
    async getStatus(@Param('instanceId') instanceId: string) {
        return this.service.getPublicationStatus(instanceId);
    }
}
