import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ORG_ID = '00000000-0000-0000-0000-000000000001';
const EVENTS = [
  '00000000-0000-0000-0000-000000000031',
  '00000000-0000-0000-0000-000000000032',
  '00000000-0000-0000-0000-000000000033',
];
const USERS = [
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000013',
];
const COUPON_IDS = [
  '00000000-0000-0000-0000-000000000041',
  '00000000-0000-0000-0000-000000000042',
];

interface TicketDef {
  name: string;
  price: number;
  qty: number;
}

const TICKET_TYPES: Record<string, TicketDef[]> = {
  tech: [
    { name: 'VIP Tech', price: 499, qty: 100 },
    { name: 'Standard Tech', price: 249, qty: 500 },
    { name: 'Basic Tech', price: 99, qty: 1000 },
  ],
  music: [
    { name: 'VIP Music', price: 599, qty: 80 },
    { name: 'Standard Music', price: 299, qty: 400 },
    { name: 'Basic Music', price: 149, qty: 800 },
  ],
  corp: [
    { name: 'VIP Corporate', price: 799, qty: 60 },
    { name: 'Standard Corporate', price: 399, qty: 300 },
    { name: 'Basic Corporate', price: 199, qty: 600 },
  ],
};

async function main() {
  let ticketTypeIndex = 0;
  const allTicketTypeIds: string[] = [];

  for (let e = 0; e < EVENTS.length; e++) {
    const eventId = EVENTS[e];
    const key = ['tech', 'music', 'corp'][e];

    for (const tt of TICKET_TYPES[key]) {
      ticketTypeIndex++;
      const ttId = `00000000-0000-4000-a000-${String(ticketTypeIndex).padStart(12, '0')}`;
      allTicketTypeIds.push(ttId);

      await prisma.ticketType.upsert({
        where: { id: ttId },
        update: {},
        create: {
          id: ttId,
          eventId,
          name: tt.name,
          description: `Ingresso ${tt.name} para o evento.`,
          price: tt.price,
          originalPrice: tt.price,
          quantity: tt.qty,
          sold: Math.floor(tt.qty * 0.3),
          saleStart: new Date('2026-05-01T00:00:00-03:00'),
          saleEnd: new Date('2026-08-14T23:59:00-03:00'),
          status: 'active',
          sortOrder: ticketTypeIndex,
        },
      });

      const lot1Id = `00000000-0000-4000-b000-${String(ticketTypeIndex).padStart(12, '0')}1`;
      const lot2Id = `00000000-0000-4000-b000-${String(ticketTypeIndex).padStart(12, '0')}2`;

      await prisma.ticketLot.createMany({
        skipDuplicates: true,
        data: [
          {
            id: lot1Id,
            ticketTypeId: ttId,
            name: 'Early Bird',
            price: Math.round(tt.price * 0.8),
            quantity: Math.floor(tt.qty * 0.3),
            sold: Math.floor(Math.floor(tt.qty * 0.3) * 0.8),
            startDate: new Date('2026-05-01T00:00:00-03:00'),
            endDate: new Date('2026-06-30T23:59:00-03:00'),
            isActive: false,
          },
          {
            id: lot2Id,
            ticketTypeId: ttId,
            name: 'Regular',
            price: tt.price,
            quantity: Math.floor(tt.qty * 0.7),
            sold: Math.floor(Math.floor(tt.qty * 0.7) * 0.2),
            startDate: new Date('2026-07-01T00:00:00-03:00'),
            endDate: new Date('2026-08-14T23:59:00-03:00'),
            isActive: true,
          },
        ],
      });
    }
  }

  await prisma.coupon.createMany({
    skipDuplicates: true,
    data: [
      {
        id: COUPON_IDS[0],
        organizationId: ORG_ID,
        eventId: EVENTS[0],
        code: 'TECH10',
        discountType: 'percentage',
        discountValue: 10,
        maxUses: 50,
        usedCount: 12,
        minTickets: 1,
        maxTickets: 5,
        validFrom: new Date('2026-05-01T00:00:00-03:00'),
        validUntil: new Date('2026-08-14T23:59:00-03:00'),
        isActive: true,
      },
      {
        id: COUPON_IDS[1],
        organizationId: ORG_ID,
        eventId: EVENTS[1],
        code: 'MUSIC20',
        discountType: 'fixed',
        discountValue: 50,
        maxUses: 30,
        usedCount: 5,
        minTickets: 2,
        maxTickets: 10,
        validFrom: new Date('2026-06-01T00:00:00-03:00'),
        validUntil: new Date('2026-08-14T23:59:00-03:00'),
        isActive: true,
      },
    ],
  });

  for (let o = 0; o < 5; o++) {
    const orderId = `00000000-0000-4000-c000-${String(o + 1).padStart(12, '0')}`;
    const eventIdx = o % 3;
    const eventId = EVENTS[eventIdx];
    const userId = USERS[o % 3];
    const isPaid = o < 4;
    const basePrice = [499, 599, 799][eventIdx];
    const qty = 1 + (o % 2);

    await prisma.order.upsert({
      where: { id: orderId },
      update: {},
      create: {
        id: orderId,
        organizationId: ORG_ID,
        eventId,
        userId,
        status: isPaid ? 'paid' : 'pending',
        total: basePrice * qty,
        discount: 0,
        fee: Math.round(basePrice * qty * 0.05 * 100) / 100,
        netTotal: Math.round(basePrice * qty * 0.95 * 100) / 100,
        paymentMethod: isPaid ? 'credit_card' : null,
        paidAt: isPaid ? new Date('2026-07-15T10:00:00-03:00') : null,
      },
    });

    const ttIdx = eventIdx * 3 + (o % 3);
    await prisma.orderItem.create({
      data: {
        id: `00000000-0000-4000-d000-${String(o + 1).padStart(12, '0')}`,
        orderId,
        ticketTypeId: allTicketTypeIds[ttIdx],
        unitPrice: basePrice,
        quantity: qty,
        total: basePrice * qty,
      },
    });
  }

  console.log('Ticket seed complete');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
