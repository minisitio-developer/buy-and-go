import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class BoletoService {
    constructor(private readonly prisma: PrismaService) {}

    async generate(paymentId: string) {
        const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
        if (!payment) throw new NotFoundException('Payment not found');
        if (payment.method !== 'boleto') {
            throw new BadRequestException('Payment method is not boleto');
        }

        const existing = await this.prisma.boletoPayment.findUnique({ where: { paymentId } });
        if (existing) return existing;

        const barcode = `${Date.now()}${Math.random().toString(36).slice(2, 10).toUpperCase().replace(/[^0-9]/g, '').padEnd(44, '0').slice(0, 44)}`;
        const dueDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

        const boleto = await this.prisma.boletoPayment.create({
            data: {
                paymentId,
                barcode,
                line: barcode.replace(/(\d{5})(\d{5})(\d{5})(\d{5})(\d{5})(\d{5})(\d{4})(\d{6})(\d{4})/, '$1.$2 $3.$4 $5.$6 $7 $8.$9'),
                url: `https://boleto.eventos.ai/${barcode}`,
                dueDate,
            },
        });

        return boleto;
    }

    async status(id: string) {
        const boleto = await this.prisma.boletoPayment.findUnique({ where: { id } });
        if (!boleto) throw new NotFoundException('Boleto not found');

        const payment = await this.prisma.payment.findUnique({ where: { id: boleto.paymentId } });

        return {
            id: boleto.id,
            barcode: boleto.barcode,
            status: payment?.status || 'unknown',
            dueDate: boleto.dueDate,
            paidAt: boleto.paidAt,
        };
    }

    async handleWebhook(body: any) {
        const { barcode, status } = body;
        if (!barcode || !status) throw new BadRequestException('Invalid webhook payload');

        const boleto = await this.prisma.boletoPayment.findUnique({ where: { barcode } });
        if (!boleto) throw new NotFoundException('Boleto not found');

        if (status === 'paid') {
            const now = new Date();
            await this.prisma.boletoPayment.update({
                where: { id: boleto.id },
                data: { paidAt: now },
            });

            await this.prisma.payment.update({
                where: { id: boleto.paymentId },
                data: { status: 'completed', paidAt: now },
            });

            await this.prisma.transaction.create({
                data: {
                    paymentId: boleto.paymentId,
                    type: 'authorization',
                    amount: 0,
                    status: 'completed',
                    gatewayResponse: body,
                },
            });
        }

        return { received: true };
    }
}
