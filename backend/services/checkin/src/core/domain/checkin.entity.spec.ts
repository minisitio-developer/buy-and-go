import { CheckIn } from './checkin.entity';

describe('CheckIn', () => {
    it('should create a check-in record', () => {
        const ci = CheckIn.create({
            attendeeId: 'att-1',
            eventId: 'event-1',
            method: 'qr',
        });
        expect(ci.status).toBe('approved');
        expect(ci.method).toBe('qr');
    });

    it('should detect duplicate check-in', () => {
        const ci = CheckIn.create({
            attendeeId: 'att-1',
            eventId: 'event-1',
            method: 'qr',
        });
        expect(() => ci.markDuplicate()).toThrow('already checked in');
    });
});
