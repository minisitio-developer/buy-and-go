import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ORG_ID = '00000000-0000-0000-0000-000000000001';
const CREATED_BY = '00000000-0000-0000-0000-000000000011';
const EVENTS = [
  { id: '00000000-0000-0000-0000-000000000031', name: 'TechConf 2026', slug: 'techconf-2026' },
  { id: '00000000-0000-0000-0000-000000000032', name: 'MusicFest 2026', slug: 'musicfest-2026' },
  { id: '00000000-0000-0000-0000-000000000033', name: 'Corporate Summit 2026', slug: 'corporate-summit-2026' },
];

const ROOM_NAMES = ['Auditório Principal', 'Sala A', 'Sala B', 'Sala de Workshops', 'Sala VIP'];
const SCHEDULE_NAMES = [
  'Credenciamento',
  'Palestra de Abertura',
  'Painel Principal',
  'Intervalo para Networking',
  'Workshop Técnico',
  'Mesa Redonda',
  'Almoço',
  'Sessão de Cases',
  'Keynote de Encerramento',
  'Happy Hour',
];

async function main() {
  for (const evt of EVENTS) {
    await prisma.event.upsert({
      where: { id: evt.id },
      update: {},
      create: {
        id: evt.id,
        organizationId: ORG_ID,
        name: evt.name,
        slug: evt.slug,
        description: `${evt.name} é o maior evento do ano.`,
        shortDescription: `Participe do ${evt.name}.`,
        type: 'presencial',
        category: 'tecnologia',
        status: 'published',
        visibility: 'public',
        timezone: 'America/Sao_Paulo',
        startDate: new Date('2026-08-15T08:00:00-03:00'),
        endDate: new Date('2026-08-17T19:00:00-03:00'),
        capacity: 2000,
        expectedPublic: 1800,
        locationName: 'Centro de Convenções Expo Center',
        address: 'Av. das Nações Unidas, 15000',
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil',
        createdBy: CREATED_BY,
      },
    });

    for (let r = 0; r < ROOM_NAMES.length; r++) {
      await prisma.eventRoom.create({
        data: {
          id: `00000000-0000-4000-8000-${evt.id.slice(0, 8)}${String(r + 1).padStart(3, '0')}`,
          eventId: evt.id,
          name: ROOM_NAMES[r],
          capacity: r === 0 ? 800 : r === 4 ? 100 : 200 + r * 50,
          floor: r < 3 ? 'Térreo' : '1º Andar',
          location: `Bloco ${String.fromCharCode(65 + r)}`,
          type: r === 0 ? 'auditorium' : r === 4 ? 'lounge' : 'room',
          sortOrder: r,
        },
      });
    }

    for (let s = 0; s < SCHEDULE_NAMES.length; s++) {
      const dayOffset = Math.floor(s / 4);
      const hour = 8 + (s % 4) * 2;
      await prisma.eventSchedule.create({
        data: {
          id: `00000000-0000-4000-9000-${evt.id.slice(0, 8)}${String(s + 1).padStart(3, '0')}`,
          eventId: evt.id,
          name: SCHEDULE_NAMES[s],
          description: `Sessão: ${SCHEDULE_NAMES[s]}`,
          speaker: s % 3 === 0 ? 'João Silva' : s % 3 === 1 ? 'Maria Souza' : 'Carlos Pereira',
          speakerBio: `Profissional experiente em ${evt.name}`,
          room: ROOM_NAMES[s % ROOM_NAMES.length],
          startTime: new Date(`2026-08-${15 + dayOffset}T${String(hour).padStart(2, '0')}:00:00-03:00`),
          endTime: new Date(`2026-08-${15 + dayOffset}T${String(hour + 1).padStart(2, '0')}:30:00-03:00`),
          type: s % 2 === 0 ? 'palestra' : 'workshop',
          capacity: 200,
          hasCertificate: s === 8,
          sortOrder: s,
        },
      });
    }
  }

  console.log('Event seed complete');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
