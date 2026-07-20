type SponsorTier = 'diamond' | 'gold' | 'silver' | 'bronze';
type SponsorStatus = 'active' | 'inactive' | 'pending' | 'cancelled';

interface SponsorProps {
    id?: string;
    organizationId: string;
    eventId: string;
    name: string;
    logoUrl?: string;
    description?: string;
    tier?: SponsorTier;
    status?: SponsorStatus;
    contractUrl?: string;
    value?: number;
    signedAt?: Date;
}

class SponsorEntity {
    id: string;
    organizationId: string;
    eventId: string;
    name: string;
    logoUrl?: string;
    description?: string;
    tier: SponsorTier;
    status: SponsorStatus;
    contractUrl?: string;
    value?: number;
    signedAt?: Date;

    static readonly ALLOWED_TIERS: SponsorTier[] = ['diamond', 'gold', 'silver', 'bronze'];

    constructor(props: SponsorProps) {
        this.id = props.id || 'test-sponsor-id';
        this.organizationId = props.organizationId;
        this.eventId = props.eventId;
        this.name = props.name;
        this.logoUrl = props.logoUrl;
        this.description = props.description;
        this.tier = props.tier || 'silver';
        this.status = props.status || 'active';
        this.contractUrl = props.contractUrl;
        this.value = props.value;
        this.signedAt = props.signedAt;
    }

    activate(): void {
        this.status = 'active';
    }

    deactivate(): void {
        this.status = 'inactive';
    }

    cancel(): void {
        this.status = 'cancelled';
    }

    changeTier(tier: SponsorTier): void {
        if (!SponsorEntity.ALLOWED_TIERS.includes(tier)) {
            throw new Error(`Invalid tier. Must be one of: ${SponsorEntity.ALLOWED_TIERS.join(', ')}`);
        }
        this.tier = tier;
    }

    sign(): void {
        this.status = 'active';
        this.signedAt = new Date();
    }

    get tierRank(): number {
        const ranks: Record<SponsorTier, number> = { diamond: 4, gold: 3, silver: 2, bronze: 1 };
        return ranks[this.tier];
    }
}

describe('SponsorEntity', () => {
    const defaultProps: SponsorProps = {
        organizationId: 'org-1',
        eventId: 'event-1',
        name: 'Acme Corp',
    };

    it('should create sponsor with silver default tier', () => {
        const sponsor = new SponsorEntity(defaultProps);
        expect(sponsor.name).toBe('Acme Corp');
        expect(sponsor.tier).toBe('silver');
        expect(sponsor.status).toBe('active');
    });

    it('should create sponsor with specified tier', () => {
        const sponsor = new SponsorEntity({ ...defaultProps, tier: 'diamond' });
        expect(sponsor.tier).toBe('diamond');
    });

    it('should activate/inactivate sponsor', () => {
        const sponsor = new SponsorEntity({ ...defaultProps, status: 'inactive' });
        expect(sponsor.status).toBe('inactive');
        sponsor.activate();
        expect(sponsor.status).toBe('active');
        sponsor.deactivate();
        expect(sponsor.status).toBe('inactive');
    });

    it('should cancel sponsor', () => {
        const sponsor = new SponsorEntity(defaultProps);
        sponsor.cancel();
        expect(sponsor.status).toBe('cancelled');
    });

    it('should change tier', () => {
        const sponsor = new SponsorEntity(defaultProps);
        sponsor.changeTier('gold');
        expect(sponsor.tier).toBe('gold');
    });

    it('should throw on invalid tier', () => {
        const sponsor = new SponsorEntity(defaultProps);
        expect(() => sponsor.changeTier('platinum' as any)).toThrow('Invalid tier');
    });

    it('should sign contract', () => {
        const sponsor = new SponsorEntity(defaultProps);
        sponsor.sign();
        expect(sponsor.status).toBe('active');
        expect(sponsor.signedAt).toBeDefined();
    });

    it('should return correct tier rank', () => {
        const diamond = new SponsorEntity({ ...defaultProps, tier: 'diamond' });
        const gold = new SponsorEntity({ ...defaultProps, tier: 'gold' });
        const silver = new SponsorEntity({ ...defaultProps, tier: 'silver' });
        const bronze = new SponsorEntity({ ...defaultProps, tier: 'bronze' });

        expect(diamond.tierRank).toBe(4);
        expect(gold.tierRank).toBe(3);
        expect(silver.tierRank).toBe(2);
        expect(bronze.tierRank).toBe(1);
    });

    it('should store optional fields', () => {
        const sponsor = new SponsorEntity({
            ...defaultProps,
            logoUrl: 'https://example.com/logo.png',
            description: 'A great sponsor',
            contractUrl: 'https://example.com/contract',
            value: 50000,
        });
        expect(sponsor.logoUrl).toBe('https://example.com/logo.png');
        expect(sponsor.description).toBe('A great sponsor');
        expect(sponsor.value).toBe(50000);
    });
});
