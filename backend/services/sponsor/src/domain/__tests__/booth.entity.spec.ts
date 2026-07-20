type BoothStatus = 'active' | 'reserved' | 'maintenance' | 'inactive';

interface BoothProps {
    id?: string;
    sponsorId: string;
    eventId: string;
    name: string;
    location?: string;
    size?: string;
    status?: BoothStatus;
    checkins?: number;
}

class BoothEntity {
    id: string;
    sponsorId: string;
    eventId: string;
    name: string;
    location?: string;
    size?: string;
    status: BoothStatus;
    checkins: number;

    constructor(props: BoothProps) {
        this.id = props.id || 'test-booth-id';
        this.sponsorId = props.sponsorId;
        this.eventId = props.eventId;
        this.name = props.name;
        this.location = props.location;
        this.size = props.size;
        this.status = props.status || 'active';
        this.checkins = props.checkins || 0;
    }

    trackCheckin(): void {
        this.checkins += 1;
    }

    reserve(): void {
        if (this.status === 'maintenance') {
            throw new Error('Cannot reserve a booth in maintenance');
        }
        this.status = 'reserved';
    }

    activate(): void {
        this.status = 'active';
    }

    setMaintenance(): void {
        this.status = 'maintenance';
    }

    deactivate(): void {
        this.status = 'inactive';
    }

    hasHighTraffic(threshold = 100): boolean {
        return this.checkins >= threshold;
    }
}

describe('BoothEntity', () => {
    const defaultProps: BoothProps = {
        sponsorId: 'sponsor-1',
        eventId: 'event-1',
        name: 'Booth A',
        location: 'Hall Principal',
        size: '10x10',
    };

    it('should create booth with active status and zero check-ins', () => {
        const booth = new BoothEntity(defaultProps);
        expect(booth.name).toBe('Booth A');
        expect(booth.status).toBe('active');
        expect(booth.checkins).toBe(0);
    });

    it('should track check-in', () => {
        const booth = new BoothEntity(defaultProps);
        booth.trackCheckin();
        expect(booth.checkins).toBe(1);
        booth.trackCheckin();
        expect(booth.checkins).toBe(2);
    });

    it('should reserve booth', () => {
        const booth = new BoothEntity(defaultProps);
        booth.reserve();
        expect(booth.status).toBe('reserved');
    });

    it('should not reserve booth in maintenance', () => {
        const booth = new BoothEntity({ ...defaultProps, status: 'maintenance' });
        expect(() => booth.reserve()).toThrow('Cannot reserve a booth in maintenance');
    });

    it('should activate booth', () => {
        const booth = new BoothEntity({ ...defaultProps, status: 'inactive' });
        booth.activate();
        expect(booth.status).toBe('active');
    });

    it('should set maintenance', () => {
        const booth = new BoothEntity(defaultProps);
        booth.setMaintenance();
        expect(booth.status).toBe('maintenance');
    });

    it('should deactivate booth', () => {
        const booth = new BoothEntity(defaultProps);
        booth.deactivate();
        expect(booth.status).toBe('inactive');
    });

    it('should identify high traffic booth', () => {
        const booth = new BoothEntity(defaultProps);
        expect(booth.hasHighTraffic()).toBe(false);
        booth.checkins = 150;
        expect(booth.hasHighTraffic()).toBe(true);
    });

    it('should accept custom threshold for high traffic', () => {
        const booth = new BoothEntity(defaultProps);
        booth.checkins = 50;
        expect(booth.hasHighTraffic(30)).toBe(true);
        expect(booth.hasHighTraffic(100)).toBe(false);
    });

    it('should store location and size', () => {
        const booth = new BoothEntity(defaultProps);
        expect(booth.location).toBe('Hall Principal');
        expect(booth.size).toBe('10x10');
    });
});
