import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ORG_ID = '00000000-0000-0000-0000-000000000001';
const EVENT_ID = '00000000-0000-0000-0000-000000000031';
const USER_IDS = [
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000013',
];

async function main() {
  const completedPayments = [
    { id: '00000000-0000-4000-l000-000000000001', method: 'credit_card', amount: 499, status: 'paid', userId: USER_IDS[0] },
    { id: '00000000-0000-4000-l000-000000000002', method: 'credit_card', amount: 249, status: 'paid', userId: USER_IDS[0] },
    { id: '00000000-0000-4000-l000-000000000003', method: 'credit_card', amount: 998, status: 'paid', userId: USER_IDS[1] },
    { id: '00000000-0000-4000-l000-000000000004', method: 'credit_card', amount: 149, status: 'paid', userId: USER_IDS[2] },
    { id: '00000000-0000-4000-l000-000000000005', method: 'credit_card', amount: 299, status: 'paid', userId: USER_IDS[1] },
    { id: '00000000-0000-4000-l000-000000000006', method: 'pix', amount: 599, status: 'paid', userId: USER_IDS[0] },
    { id: '00000000-0000-4000-l000-000000000007', method: 'pix', amount: 399, status: 'paid', userId: USER_IDS[2] },
    { id: '00000000-0000-4000-l000-000000000008', method: 'pix', amount: 199, status: 'paid', userId: USER_IDS[1] },
    { id: '00000000-0000-4000-l000-000000000009', method: 'boleto', amount: 799, status: 'paid', userId: USER_IDS[2] },
    { id: '00000000-0000-4000-l000-000000000010', method: 'boleto', amount: 1298, status: 'paid', userId: USER_IDS[0] },
  ];

  for (let i = 0; i < completedPayments.length; i++) {
    const p = completedPayments[i];
    const fee = Math.round(p.amount * 0.05 * 100) / 100;
    const total = p.amount + fee;

    await prisma.payment.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        organizationId: ORG_ID,
        eventId: EVENT_ID,
        userId: p.userId,
        amount: p.amount,
        currency: 'BRL',
        fee,
        total,
        method: p.method,
        status: p.status,
        gateway: 'stripe',
        gatewayId: `pi_${p.id.replace(/-/g, '')}`,
        installments: p.method === 'credit_card' ? 1 : 1,
        paidAt: new Date('2026-07-20T10:00:00-03:00'),
      },
    });

    await prisma.transaction.upsert({
      where: { id: `${p.id.slice(0, 35)}t` },
      update: {},
      create: {
        id: `${p.id.slice(0, 35)}t`,
        paymentId: p.id,
        type: 'payment',
        amount: total,
        status: 'approved',
        gatewayResponse: { id: `txn_${i}`, status: 'succeeded' },
      },
    });

    if (p.method === 'pix') {
      await prisma.pixPayment.upsert({
        where: { paymentId: p.id },
        update: {},
        create: {
          id: `${p.id.slice(0, 35)}p`,
          paymentId: p.id,
          txid: `EVP${String(100000 + i)}${p.id.slice(0, 8)}`,
          qrCode: `https://qr.eventos.ai/pix/${p.id}`,
          qrCodeText: `000201010212261060014br.gov.bcb.pix2584https://api.eventos.ai/pix/${p.id}5204000053039865802BR5913EventOS AI6009Sao Paulo62070503***6304ABCD`,
          expiration: new Date('2026-07-21T23:59:00-03:00'),
          paidAt: new Date('2026-07-20T10:05:00-03:00'),
        },
      });
    }

    if (p.method === 'boleto') {
      await prisma.boletoPayment.upsert({
        where: { paymentId: p.id },
        update: {},
        create: {
          id: `${p.id.slice(0, 35)}b`,
          paymentId: p.id,
          barcode: `34191${String(7900 + i)}${String(10000 + i * 99)}${String(123456 + i)}${String(78900 + i)}${String(12345 + i)}${String(6789 + i)}0${String(100 + i)}`,
          line: `34191.${String(7900 + i)}0${String(10000 + i * 99).slice(0, 5)} 12345.${String(67890 + i * 100).slice(0, 4)} 67891.${String(0 + i)}000${String(123 + i)} 1 ${String(789000 + i * 100)}`,
          url: `https://boleto.eventos.ai/boleto/${p.id}`,
          dueDate: new Date('2026-07-25T23:59:00-03:00'),
          paidAt: new Date('2026-07-22T10:00:00-03:00'),
        },
      });
    }
  }

  const refundPaymentId = '00000000-0000-4000-l000-000000000005';
  await prisma.refund.upsert({
    where: { id: '00000000-0000-4000-m000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-m000-000000000001',
      paymentId: refundPaymentId,
      amount: 299,
      reason: 'Cancelamento por solicitação do cliente',
      status: 'completed',
      initiatedBy: USER_IDS[1],
      approvedBy: USER_IDS[0],
      processedAt: new Date('2026-07-25T14:00:00-03:00'),
    },
  });

  await prisma.payment.update({
    where: { id: refundPaymentId },
    data: { status: 'refunded', refundedAt: new Date('2026-07-25T14:00:00-03:00') },
  });

  await prisma.gatewayConfig.upsert({
    where: {
      organizationId_gateway: { organizationId: ORG_ID, gateway: 'stripe' },
    },
    update: {},
    create: {
      id: '00000000-0000-4000-n000-000000000001',
      organizationId: ORG_ID,
      gateway: 'stripe',
      credentials: {
        publishableKey: 'pk_test_example',
        secretKey: 'sk_test_example',
        webhookSecret: 'whsec_example',
      },
      webhookSecret: 'whsec_example',
      active: true,
    },
  });

  console.log('Payment seed complete');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
