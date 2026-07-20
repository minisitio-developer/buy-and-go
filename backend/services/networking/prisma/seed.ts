import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EVENTS = [
    { id: '00000000-0000-0000-0000-000000000031', prefix: 'TC' },
    { id: '00000000-0000-0000-0000-000000000032', prefix: 'MF' },
    { id: '00000000-0000-0000-0000-000000000033', prefix: 'CS' },
];

const INTERESTS = [
    ['AI', 'Machine Learning', 'Data Science', 'Cloud Computing'],
    ['UX Design', 'Product Management', 'Agile', 'Leadership'],
    ['Cybersecurity', 'Blockchain', 'IoT', 'DevOps'],
    ['Mobile Development', 'Web Development', 'Open Source', 'API Design'],
    ['Digital Marketing', 'Growth Hacking', 'SEO', 'Content Strategy'],
    ['Venture Capital', 'Startups', 'Fintech', 'SaaS'],
    ['AR/VR', 'Gaming', '3D Modeling', 'Computer Graphics'],
    ['Sustainability', 'Clean Tech', 'BioTech', 'HealthTech'],
];

const EXPERTISE = [
    ['Python', 'TensorFlow', 'PyTorch', 'NLP'],
    ['Figma', 'Sketch', 'User Research', 'Prototyping'],
    ['Kubernetes', 'Docker', 'AWS', 'Terraform'],
    ['React', 'Node.js', 'TypeScript', 'GraphQL'],
    ['Google Ads', 'Facebook Ads', 'Analytics', 'CRM'],
    ['Financial Modeling', 'Due Diligence', 'M&A', 'Fundraising'],
    ['Unity', 'Unreal Engine', 'Blender', 'WebGL'],
    ['CRISPR', 'Clinical Trials', 'FDA Compliance', 'Medical Devices'],
];

const GOALS = [
    ['Find co-founder', 'Network with investors', 'Learn new technologies'],
    ['Hire talent', 'Find mentors', 'Collaborate on projects'],
    ['Sell product', 'Partnership opportunities', 'Market expansion'],
    ['Recruit for team', 'Knowledge sharing', 'Industry trends'],
    ['Raise funding', 'Beta testers', 'Press coverage'],
];

const LOOKING_FOR = [
    ['Mentors', 'Investors', 'Technical co-founders'],
    ['Designers', 'Developers', 'Product managers'],
    ['Partners', 'Clients', 'Distributors'],
    ['Advisors', 'Board members', 'Executive hires'],
    ['Researchers', 'Academics', 'Subject matter experts'],
];

const INDUSTRIES = ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Energy', 'Media', 'Manufacturing'];
const ROLES = ['Engineer', 'Designer', 'Product Manager', 'Founder', 'Executive', 'Researcher', 'Consultant', 'Investor'];

async function main() {
    for (const evt of EVENTS) {
        for (let p = 0; p < 24; p++) {
            const participantId = `p${evt.prefix}-${String(p + 1).padStart(3, '0')}${'0'.repeat(24)}`.slice(0, 36);

            await prisma.participantProfile.upsert({
                where: { participantId },
                update: {},
                create: {
                    participantId,
                    eventId: evt.id,
                    interests: INTERESTS[p % INTERESTS.length],
                    expertise: EXPERTISE[p % EXPERTISE.length],
                    goals: GOALS[p % GOALS.length],
                    lookingFor: LOOKING_FOR[p % LOOKING_FOR.length],
                    industry: INDUSTRIES[p % INDUSTRIES.length],
                    role: ROLES[p % ROLES.length],
                    company: ['Tech Corp', 'InnoWave', 'DataDriven', 'CloudBase', 'GreenFuture', 'FinLeap', 'MedTechX', 'EduPrime'][p % 8],
                    bio: `${ROLES[p % ROLES.length]} passionate about ${INTERESTS[p % INTERESTS.length][0]} and building impactful solutions.`,
                    photoUrl: p % 4 === 0 ? `https://storage.eventos.ai/photos/${evt.prefix.toLowerCase()}/participant_${p + 1}.jpg` : null,
                    linkedInUrl: `https://linkedin.com/in/participant-${evt.prefix.toLowerCase()}-${p + 1}`,
                },
            });
        }

        for (let m = 0; m < 6; m++) {
            const p1 = `p${evt.prefix}-${String(m + 1).padStart(3, '0')}${'0'.repeat(24)}`.slice(0, 36);
            const p2 = `p${evt.prefix}-${String(m + 7).padStart(3, '0')}${'0'.repeat(24)}`.slice(0, 36);
            const score = Math.round((0.5 + Math.random() * 0.5) * 100) / 100;

            await prisma.match.upsert({
                where: {
                    eventId_participantId1_participantId2: { eventId: evt.id, participantId1: p1, participantId2: p2 },
                },
                update: {},
                create: {
                    eventId: evt.id,
                    participantId1: p1,
                    participantId2: p2,
                    score,
                    matchedBy: m < 3 ? 'interests' : 'ai',
                    status: m < 2 ? 'matched' : 'pending',
                    matchedAt: new Date('2026-08-15T09:00:00-03:00'),
                },
            });
        }

        for (let c = 0; c < 3; c++) {
            const p1 = `p${evt.prefix}-${String(c + 1).padStart(3, '0')}${'0'.repeat(24)}`.slice(0, 36);
            const p2 = `p${evt.prefix}-${String(c + 4).padStart(3, '0')}${'0'.repeat(24)}`.slice(0, 36);

            await prisma.connection.upsert({
                where: {
                    eventId_participantId1_participantId2: { eventId: evt.id, participantId1: p1, participantId2: p2 },
                },
                update: {},
                create: {
                    eventId: evt.id,
                    participantId1: p1,
                    participantId2: p2,
                    message: `Great connecting at ${evt.prefix}! Let's collaborate.`,
                    connectedAt: new Date('2026-08-15T10:00:00-03:00'),
                },
            });
        }

        for (let l = 0; l < 12; l++) {
            const participantId = `p${evt.prefix}-${String(l + 1).padStart(3, '0')}${'0'.repeat(24)}`.slice(0, 36);

            await prisma.proximityEvent.create({
                data: {
                    eventId: evt.id,
                    participantId,
                    latitude: -23.5505 + l * 0.002,
                    longitude: -46.6333 + l * 0.002,
                    accuracy: 5 + Math.random() * 10,
                    detectedAt: new Date(`2026-08-15T${String(9 + Math.floor(l / 4)).padStart(2, '0')}:${String((l % 4) * 15).padStart(2, '0')}:00-03:00`),
                },
            });
        }

        for (let r = 0; r < 8; r++) {
            const participantId = `p${evt.prefix}-${String(r + 1).padStart(3, '0')}${'0'.repeat(24)}`.slice(0, 36);
            const targetId = `p${evt.prefix}-${String(r + 10).padStart(3, '0')}${'0'.repeat(24)}`.slice(0, 36);

            await prisma.recommendation.create({
                data: {
                    eventId: evt.id,
                    participantId,
                    targetId,
                    reason: r < 3 ? 'Shared interest in AI/ML' : r < 6 ? 'Complementary expertise' : 'Nearby participant',
                    score: Math.round((0.4 + Math.random() * 0.6) * 100) / 100,
                    type: r < 4 ? 'participant' : r < 6 ? 'booth' : 'session',
                },
            });
        }
    }

    console.log('Networking seed complete');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
