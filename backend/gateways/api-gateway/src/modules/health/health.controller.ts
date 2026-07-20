import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GatewayService } from '../gateway/gateway.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    private readonly services: string[];

    constructor(private readonly gatewayService: GatewayService) {
        this.services = [
            'identity',
            'event',
            'ticket',
            'checkin',
            'crm',
            'sponsor',
            'payment',
            'ai',
        ];
    }

    @Get()
    @ApiOperation({ summary: 'Check health of gateway and all upstream services' })
    @ApiResponse({ status: 200, description: 'Health check response' })
    async check() {
        const serviceStatuses: Record<string, string> = {};

        const results = await Promise.allSettled(
            this.services.map(async (service) => {
                const healthy = await this.gatewayService.checkServiceHealth(service);
                serviceStatuses[service] = healthy ? 'up' : 'down';
            }),
        );

        this.services.forEach((service) => {
            if (!serviceStatuses[service]) {
                serviceStatuses[service] = 'down';
            }
        });

        const allUp = Object.values(serviceStatuses).every((status) => status === 'up');

        return {
            status: allUp ? 'ok' : 'degraded',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            services: serviceStatuses,
        };
    }
}
