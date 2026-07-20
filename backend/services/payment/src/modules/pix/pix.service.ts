import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class PixService {
    constructor(private readonly prisma: PrismaService) {}

    async generate(paymentId: string) {
        const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
        if (!payment) throw new NotFoundException('Payment not found');
        if (payment.method !== 'pix') {
            throw new BadRequestException('Payment method is not PIX');
        }

        const existing = await this.prisma.pixPayment.findUnique({ where: { paymentId } });
        if (existing) return existing;

        const txid = `PIX${Date.now()}${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
        const expiration = new Date(Date.now() + 30 * 60 * 1000);

        const pix = await this.prisma.pixPayment.create({
            data: {
                paymentId,
                txid,
                qrCode: `pix-qr://${txid}`,
                qrCodeText: `00020101021226880014br.gov.bcb.pix2558pix.example.com/pix/${txid}5204000053039865406${Number(payment.amount).toFixed(2)}5802BR5925Eventos${txid.slice(0, 8)}6008BRASILIA62070503***6304ABCD`,
                expiration,
            },
        });

        return pix;
    }

    async status(txid: string) {
        const pix = await this.prisma.pixPayment.findUnique({ where: { txid } });
        if (!pix) throw new NotFoundException('PIX not found');

        const payment = await this.prisma.payment.findUnique({ where: { id: pix.paymentId } });

        return {
            txid: pix.txid,
            status: payment?.status || 'unknown',
            paidAt: pix.paidAt,
            expiration: pix.expiration,
        };
    }

    async handleWebhook(body: any) {
        const { txid, status } = body;
        if (!txid || !status) throw new BadRequestException('Invalid webhook payload');

        const pix = await this.prisma.pixPayment.findUnique({ where: { txid } });
        if (!pix) throw new NotFoundException('PIX not found');

        if (status === 'paid') {
            const now = new Date();
            await this.prisma.pixPayment.update({
                where: { id: pix.id },
                data: { paidAt: now },
            });

            await this.prisma.payment.update({
                where: { id: pix.paymentId },
                data: { status: 'completed', paidAt: now },
            });

            await this.prisma.transaction.create({
                data: {
                    paymentId: pix.paymentId,
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
