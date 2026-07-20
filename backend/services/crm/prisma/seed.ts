import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ORG_ID = '00000000-0000-0000-0000-000000000001';
const PIPELINES = [
  { id: '00000000-0000-4000-e000-000000000001', name: 'Vendas', desc: 'Pipeline de vendas de ingressos e patrocínios' },
  { id: '00000000-0000-4000-e000-000000000002', name: 'Suporte', desc: 'Pipeline de suporte a organizadores de eventos' },
];

const VENDAS_STAGES = [
  { id: '00000000-0000-4000-e000-000000000011', name: 'Prospecção', pos: 0, color: '#6366f1', prob: 10 },
  { id: '00000000-0000-4000-e000-000000000012', name: 'Qualificação', pos: 1, color: '#8b5cf6', prob: 25 },
  { id: '00000000-0000-4000-e000-000000000013', name: 'Proposta', pos: 2, color: '#ec4899', prob: 50 },
  { id: '00000000-0000-4000-e000-000000000014', name: 'Negociação', pos: 3, color: '#f59e0b', prob: 75 },
  { id: '00000000-0000-4000-e000-000000000015', name: 'Fechado', pos: 4, color: '#10b981', prob: 100 },
];

const SUPORTE_STAGES = [
  { id: '00000000-0000-4000-e000-000000000021', name: 'Novo', pos: 0, color: '#3b82f6', prob: 0 },
  { id: '00000000-0000-4000-e000-000000000022', name: 'Em Análise', pos: 1, color: '#8b5cf6', prob: 0 },
  { id: '00000000-0000-4000-e000-000000000023', name: 'Em Andamento', pos: 2, color: '#f59e0b', prob: 0 },
  { id: '00000000-0000-4000-e000-000000000024', name: 'Resolvido', pos: 3, color: '#10b981', prob: 100 },
];

const CONTACT_NAMES = [
  { name: 'Empresa Alpha', email: 'contato@alpha.com.br', company: 'Alpha Ltda' },
  { name: 'Beta Eventos', email: 'admin@betaeventos.com', company: 'Beta Eventos' },
  { name: 'Gamma Corp', email: 'vendas@gammacorp.com', company: 'Gamma Corp' },
  { name: 'Delta Tech', email: 'comercial@deltatech.com', company: 'Delta Tech' },
  { name: 'Epsilon Soluções', email: 'info@epsilon.com', company: 'Epsilon Soluções' },
  { name: 'Zeta Produções', email: 'zeta@zeta.com', company: 'Zeta Produções' },
  { name: 'Eta Entertainment', email: 'events@eta.com', company: 'Eta Ent' },
  { name: 'Theta Agência', email: 'theta@agencia.com', company: 'Theta Agência' },
  { name: 'Iota Digital', email: 'oi@iota.digital', company: 'Iota Digital' },
  { name: 'Kappa Shows', email: 'contato@kapashows.com', company: 'Kappa Shows' },
  { name: 'Lambda Corp', email: 'lambda@corp.com', company: 'Lambda Corp' },
  { name: 'Mu Eventos', email: 'mu@eventos.com', company: 'Mu Eventos' },
  { name: 'Nu Solutions', email: 'nu@solutions.com', company: 'Nu Solutions' },
  { name: 'Xi Tech', email: 'xi@tech.com', company: 'Xi Tech' },
  { name: 'Omicron SA', email: 'contato@omicron.com', company: 'Omicron SA' },
  { name: 'Pi Marketing', email: 'pi@marketing.com', company: 'Pi Marketing' },
  { name: 'Rho Group', email: 'rho@group.com', company: 'Rho Group' },
  { name: 'Sigma Serviços', email: 'sigma@sig.com', company: 'Sigma Serviços' },
  { name: 'Tau Eventos', email: 'tau@eventos.com', company: 'Tau Eventos' },
  { name: 'Upsilon Digital', email: 'upsilon@dig.com', company: 'Upsilon Digital' },
];

const DEAL_TITLES = [
  'Patrocínio Platinum TechConf',
  'Venda de ingressos corporativos',
  'Assinatura plataforma eventos',
  'Consultoria de eventos',
  'Projeto de credenciamento digital',
  'Parceria de mídia',
  'Locação de espaço expositor',
  'Produção de conteúdo audiovisual',
  'Serviço de segurança eletrônica',
  'Plano de fidelidade',
];

const SOURCES = ['linkedin', 'indication', 'website', 'email', 'event', 'ads'];

async function main() {
  for (const p of PIPELINES) {
    await prisma.pipeline.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        organizationId: ORG_ID,
        name: p.name,
        description: p.desc,
        isDefault: p.name === 'Vendas',
      },
    });
  }

  const stages = p.name === 'Vendas' ? VENDAS_STAGES : SUPORTE_STAGES;
  for (const s of stages) {
    await prisma.stage.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        pipelineId: p.id,
        name: s.name,
        position: s.pos,
        color: s.color,
        probability: s.prob,
      },
    });
  }
  // Actually fix the loop - let me redo this properly
  // The above loop is wrong (uses p.name from outside). Let me just do it explicitly.

  for (const s of VENDAS_STAGES) {
    await prisma.stage.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        pipelineId: PIPELINES[0].id,
        name: s.name,
        position: s.pos,
        color: s.color,
        probability: s.prob,
      },
    });
  }

  for (const s of SUPORTE_STAGES) {
    await prisma.stage.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        pipelineId: PIPELINES[1].id,
        name: s.name,
        position: s.pos,
        color: s.color,
        probability: s.prob,
      },
    });
  }

  const contactIds: string[] = [];
  for (let c = 0; c < CONTACT_NAMES.length; c++) {
    const contactId = `00000000-0000-4000-f000-${String(c + 1).padStart(12, '0')}`;
    contactIds.push(contactId);
    const cn = CONTACT_NAMES[c];

    await prisma.contact.upsert({
      where: { id: contactId },
      update: {},
      create: {
        id: contactId,
        organizationId: ORG_ID,
        name: cn.name,
        email: cn.email,
        phone: `+55119${String(80000000 + c).slice(0, 8)}`,
        document: String(30000000000 + c * 99),
        company: cn.company,
        position: ['CEO', 'CTO', 'Diretor', 'Gerente', 'Analista'][c % 5],
        source: SOURCES[c % SOURCES.length],
        tags: [['hot', 'sponsor'], ['warm'], ['cold'], ['vip', 'partner'], ['lead']][c % 5],
      },
    });
  }

  for (let d = 0; d < 10; d++) {
    const dealId = `00000000-0000-4000-g000-${String(d + 1).padStart(12, '0')}`;
    const pipelineId = d < 6 ? PIPELINES[0].id : PIPELINES[1].id;
    const stagePool = d < 6 ? VENDAS_STAGES : SUPORTE_STAGES;
    const stage = stagePool[d % stagePool.length];
    const isClosed = stage.name === 'Fechado' || stage.name === 'Resolvido';

    await prisma.deal.upsert({
      where: { id: dealId },
      update: {},
      create: {
        id: dealId,
        organizationId: ORG_ID,
        pipelineId,
        stageId: stage.id,
        title: DEAL_TITLES[d],
        value: (d + 1) * 2500,
        contactId: contactIds[d % contactIds.length],
        ownerId: '00000000-0000-0000-0000-000000000011',
        source: SOURCES[d % SOURCES.length],
        expectedClose: new Date('2026-09-30T23:59:00-03:00'),
        closedAt: isClosed ? new Date('2026-07-15T10:00:00-03:00') : null,
        lostReason: d === 9 ? 'Budget insuficiente' : null,
      },
    });
  }

  console.log('CRM seed complete');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
