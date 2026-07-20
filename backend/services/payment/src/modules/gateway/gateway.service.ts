import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

interface GatewayStrategy {
    process(data: any): Promise<any>;
    refund(data: any): Promise<any>;
    status(data: any): Promise<any>;
}

class StripeGateway implements GatewayStrategy {
    async process(data: any) { return { gatewayId: `stripe_${Date.now()}`, status: 'processing' }; }
    async refund(data: any) { return { status: 'refunded', gatewayId: data.gatewayId }; }
    async status(data: any) { return { status: 'completed', gatewayId: data.gatewayId }; }
}

class AsaasGateway implements GatewayStrategy {
    async process(data: any) { return { gatewayId: `asaas_${Date.now()}`, status: 'processing' }; }
    async refund(data: any) { return { status: 'refunded', gatewayId: data.gatewayId }; }
    async status(data: any) { return { status: 'completed', gatewayId: data.gatewayId }; }
}

class MercadoPagoGateway implements GatewayStrategy {
    async process(data: any) { return { gatewayId: `mp_${Date.now()}`, status: 'processing' }; }
    async refund(data: any) { return { status: 'refunded', gatewayId: data.gatewayId }; }
    async status(data: any) { return { status: 'completed', gatewayId: data.gatewayId }; }
}

@Injectable()
export class GatewayService {
    private strategies: Record<string, GatewayStrategy>;

    constructor(private readonly prisma: PrismaService) {
        this.strategies = {
            stripe: new StripeGateway(),
            asaas: new AsaasGateway(),
            mercado_pago: new MercadoPagoGateway(),
        };
    }

    async create(data: {
        organizationId: string;
        gateway: string;
        credentials: Record<string, any>;
        webhookSecret?: string;
    }) {
        const existing = await this.prisma.gatewayConfig.findUnique({
            where: { organizationId_gateway: { organizationId: data.organizationId, gateway: data.gateway } },
        });
        if (existing) throw new ConflictException('Gateway config already exists for this organization');

        return this.prisma.gatewayConfig.create({
            data: {
                organizationId: data.organizationId,
                gateway: data.gateway,
                credentials: data.credentials,
                webhookSecret: data.webhookSecret,
            },
        });
    }

    async findAll(organizationId?: string) {
        const where: any = {};
        if (organizationId) where.organizationId = organizationId;
        return this.prisma.gatewayConfig.findMany({ where, orderBy: { createdAt: 'desc' } });
    }

    async update(id: string, data: {
        credentials?: Record<string, any>;
        webhookSecret?: string;
        active?: boolean;
    }) {
        const config = await this.prisma.gatewayConfig.findUnique({ where: { id } });
        if (!config) throw new NotFoundException('Gateway config not found');

        return this.prisma.gatewayConfig.update({
            where: { id },
            data: {
                ...(data.credentials && { credentials: data.credentials }),
                ...(data.webhookSecret !== undefined && { webhookSecret: data.webhookSecret }),
                ...(data.active !== undefined && { active: data.active }),
            },
        });
    }

    getStrategy(gateway: string): GatewayStrategy {
        const strategy = this.strategies[gateway];
        if (!strategy) throw new NotFoundException(`Gateway strategy not found for ${gateway}`);
        return strategy;
    }
}
