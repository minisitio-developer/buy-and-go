import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

const ORG_ID = '00000000-0000-0000-0000-000000000001';
const ADMIN_ID = '00000000-0000-0000-0000-000000000011';
const ORG_USER_ID = '00000000-0000-0000-0000-000000000012';
const REGULAR_USER_ID = '00000000-0000-0000-0000-000000000013';
const MEMBER1_ID = '00000000-0000-0000-0000-000000000021';
const MEMBER2_ID = '00000000-0000-0000-0000-000000000022';

async function main() {
  const passwordHash = await hash('password123', 10);

  await prisma.organization.upsert({
    where: { id: ORG_ID },
    update: {},
    create: {
      id: ORG_ID,
      name: 'EventOS AI Demo',
      slug: 'eventos-ai-demo',
      plan: 'enterprise',
      status: 'active',
      settings: { theme: 'light', locale: 'pt-BR' },
      features: { maxEvents: 50, maxAttendees: 10000, crm: true, sponsor: true },
    },
  });

  await prisma.user.createMany({
    skipDuplicates: true,
    data: [
      {
        id: ADMIN_ID,
        email: 'admin@eventos.ai',
        passwordHash,
        name: 'Admin Principal',
        document: '52998224725',
        phone: '+5511999999999',
        locale: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        emailVerifiedAt: new Date(),
        isActive: true,
        metadata: { role: 'super_admin' },
      },
      {
        id: ORG_USER_ID,
        email: 'org@eventos.ai',
        passwordHash,
        name: 'Gerente Organizador',
        document: '12345678909',
        phone: '+5511988888888',
        locale: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        emailVerifiedAt: new Date(),
        isActive: true,
        metadata: { role: 'org_admin' },
      },
      {
        id: REGULAR_USER_ID,
        email: 'user@eventos.ai',
        passwordHash,
        name: 'Usuário Comum',
        document: '98765432100',
        phone: '+5511977777777',
        locale: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        emailVerifiedAt: new Date(),
        isActive: true,
        metadata: { role: 'member' },
      },
    ],
  });

  await prisma.organizationMember.createMany({
    skipDuplicates: true,
    data: [
      {
        id: MEMBER1_ID,
        organizationId: ORG_ID,
        userId: ADMIN_ID,
        role: 'owner',
        permissions: ['*'],
      },
      {
        id: MEMBER2_ID,
        organizationId: ORG_ID,
        userId: ORG_USER_ID,
        role: 'admin',
        permissions: ['event:create', 'event:read', 'event:update', 'ticket:manage', 'checkin:manage'],
      },
    ],
  });

  console.log('Identity seed complete');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
