import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ORG_ID = '00000000-0000-0000-0000-000000000001';
const EVENTS = [
  { id: '00000000-0000-0000-0000-000000000031', prefix: 'TC' },
  { id: '00000000-0000-0000-0000-000000000032', prefix: 'MF' },
  { id: '00000000-0000-0000-0000-000000000033', prefix: 'CS' },
];

const FIRST_NAMES = [
  'Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Fabio', 'Gabriela', 'Hugo',
  'Isabela', 'João', 'Karine', 'Lucas', 'Marina', 'Nelson', 'Olivia',
  'Paulo', 'Rafaela', 'Samuel', 'Tatiane', 'Ubirajara', 'Valentina',
  'Wagner', 'Ximena', 'Yuri', 'Zélia', 'André', 'Beatriz', 'Caio',
  'Daniela', 'Eduardo', 'Fernanda', 'Gustavo', 'Helena', 'Igor',
  'Júlia', 'Kleber', 'Larissa', 'Marcos', 'Natália', 'Otávio',
  'Priscila', 'Ricardo', 'Sandra', 'Thiago', 'Úrsula', 'Vinicius',
  'Wanessa', 'Alexandre', 'Bianca', 'Cristiano',
];

const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Pereira', 'Costa',
  'Fernandes', 'Almeida', 'Barbosa', 'Ribeiro', 'Carvalho', 'Gomes',
  'Martins', 'Araújo', 'Melo', 'Cavalcanti', 'Dias', 'Moreira', 'Teixeira',
];

async function main() {
  for (const evt of EVENTS) {
    const attendees: string[] = [];

    for (let a = 0; a < 50; a++) {
      const attendeeId = `a${evt.prefix}-${String(a + 1).padStart(3, '0')}${'0'.repeat(24)}`.slice(0, 36);
      const firstName = FIRST_NAMES[a % FIRST_NAMES.length];
      const lastName = LAST_NAMES[a % LAST_NAMES.length];
      const email = `${firstName.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '')}.${lastName.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '')}${a}@email.com`;

      await prisma.attendee.upsert({
        where: { id: attendeeId },
        update: {},
        create: {
          id: attendeeId,
          organizationId: ORG_ID,
          eventId: evt.id,
          name: `${firstName} ${lastName}`,
          email,
          phone: `+55119${String(90000000 + a).slice(0, 8)}`,
          document: String(10000000000 + a * 111),
          documentType: 'CPF',
          company: ['Tech Corp', 'Music Co', 'Global Inc', 'StartupXYZ', 'BigBiz'][a % 5],
          position: ['Engenheiro', 'Designer', 'Gerente', 'Analista', 'Diretor'][a % 5],
          category: a < 10 ? 'vip' : a < 30 ? 'visitor' : 'speaker',
          isApproved: true,
        },
      });

      const qrCode = `QR-${evt.prefix}-${String(a + 1).padStart(4, '0')}`;
      await prisma.credential.upsert({
        where: { qrCode },
        update: {},
        create: {
          id: `c${evt.prefix}-${String(a + 1).padStart(3, '0')}${'0'.repeat(24)}`.slice(0, 36),
          attendeeId,
          eventId: evt.id,
          qrCode,
          qrData: JSON.stringify({ attendeeId, eventId: evt.id, name: `${firstName} ${lastName}` }),
          isActive: true,
        },
      });

      attendees.push(attendeeId);
    }

    for (let c = 0; c < 20; c++) {
      const attendeeId = attendees[c];
      const photoUrl = c % 3 === 0 ? `https://storage.eventos.ai/photos/${evt.prefix.toLowerCase()}/attendee_${c + 1}.jpg` : null;

      await prisma.checkIn.upsert({
        where: {
          attendeeId_eventId: { attendeeId, eventId: evt.id },
        },
        update: {},
        create: {
          id: `chk${evt.prefix}-${String(c + 1).padStart(3, '0')}${'0'.repeat(24)}`.slice(0, 36),
          attendeeId,
          eventId: evt.id,
          method: photoUrl ? 'face' : 'qr',
          checkedInBy: '00000000-0000-0000-0000-000000000011',
          deviceId: photoUrl ? 'CAM-001' : 'QR-SCN-001',
          ipAddress: `192.168.1.${c + 10}`,
          location: { lat: -23.5505 + c * 0.001, lng: -46.6333 + c * 0.001 },
          photoUrl,
          isSynced: true,
          syncedAt: new Date('2026-08-15T08:00:00-03:00'),
          createdAt: new Date('2026-08-15T08:00:00-03:00'),
        },
      });
    }
  }

  console.log('Checkin seed complete');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
