import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ORG_ID = '00000000-0000-0000-0000-000000000001';
const EVENT_ID = '00000000-0000-0000-0000-000000000031';

const SPONSORS = [
  { id: '00000000-0000-4000-h000-000000000001', name: 'TechGiant', tier: 'diamond' as const, value: 150000 },
  { id: '00000000-0000-4000-h000-000000000002', name: 'CloudMaster', tier: 'gold' as const, value: 80000 },
  { id: '00000000-0000-4000-h000-000000000003', name: 'DevTools Inc', tier: 'gold' as const, value: 75000 },
  { id: '00000000-0000-4000-h000-000000000004', name: 'StartupHub', tier: 'silver' as const, value: 35000 },
  { id: '00000000-0000-4000-h000-000000000005', name: 'CodeAcademy', tier: 'silver' as const, value: 30000 },
];

async function main() {
  for (const sp of SPONSORS) {
    await prisma.sponsor.upsert({
      where: { id: sp.id },
      update: {},
      create: {
        id: sp.id,
        organizationId: ORG_ID,
        eventId: EVENT_ID,
        name: sp.name,
        logoUrl: `https://storage.eventos.ai/sponsors/${sp.name.toLocaleLowerCase('pt-BR')}.png`,
        description: `${sp.name} é patrocinador ${sp.tier} do TechConf 2026.`,
        tier: sp.tier,
        status: 'active',
        contractUrl: `https://storage.eventos.ai/contracts/${sp.id}.pdf`,
        value: sp.value,
        signedAt: new Date('2026-03-15T10:00:00-03:00'),
      },
    });

    const boothId = `00000000-0000-4000-i000-${sp.id.slice(0, 8)}000000000001`;
    await prisma.sponsorBooth.upsert({
      where: { id: boothId },
      update: {},
      create: {
        id: boothId,
        sponsorId: sp.id,
        eventId: EVENT_ID,
        name: `Booth ${sp.name}`,
        location: sp.tier === 'diamond' ? 'Hall Principal - Entrada' : `Pavilhão ${String.fromCharCode(65 + SPONSORS.indexOf(sp))}`,
        size: sp.tier === 'diamond' ? '100m²' : sp.tier === 'gold' ? '60m²' : '30m²',
        status: 'active',
        checkins: Math.floor(Math.random() * 500) + 100,
      },
    });

    for (let m = 0; m < 3; m++) {
      const metricId = `00000000-0000-4000-j000-${sp.id.slice(0, 8)}${String(m + 1).padStart(4, '0')}`;
      await prisma.sponsorMetric.upsert({
        where: { id: metricId },
        update: {},
        create: {
          id: metricId,
          sponsorId: sp.id,
          eventId: EVENT_ID,
          visitors: Math.floor(Math.random() * 300) + 50,
          avgStayTime: Math.random() * 10 + 2,
          revisitRate: Math.random() * 0.4,
          peakHour: [10, 14, 17][m],
          profile: { ageRange: '25-45', topInterests: ['cloud', 'devops', 'ai'] },
          recordedAt: new Date(`2026-08-${15 + m}T${[12, 16, 18][m]}:00:00-03:00`),
        },
      });
    }
  }

  const paymentSponsors = [SPONSORS[0], SPONSORS[2]];
  const paymentValues = [75000, 37500];

  for (let p = 0; p < paymentSponsors.length; p++) {
    const paymentId = `00000000-0000-4000-k000-${String(p + 1).padStart(12, '0')}`;
    await prisma.sponsorPayment.upsert({
      where: { id: paymentId },
      update: {},
      create: {
        id: paymentId,
        sponsorId: paymentSponsors[p].id,
        installment: 1,
        value: paymentValues[p],
        dueDate: new Date('2026-06-15T23:59:00-03:00'),
        paidAt: new Date('2026-06-10T10:00:00-03:00'),
        status: 'paid',
      },
    });
  }

  console.log('Sponsor seed complete');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
