import { TicketType } from './ticket.entity';

describe('TicketType', () => {
    it('should create active ticket type', () => {
        const tt = TicketType.create({
            id: '1', eventId: 'event-1', name: 'Passaporte Completo',
            price: 199.90, quantity: 1000,
        });
        expect(tt.status).toBe('active');
        expect(tt.available).toBe(1000);
    });

    it('should sell tickets and reduce availability', () => {
        const tt = TicketType.create({
            id: '1', eventId: 'event-1', name: 'Passaporte',
            price: 199.90, quantity: 1000,
        });
        tt.sell(5);
        expect(tt.sold).toBe(5);
        expect(tt.available).toBe(995);
    });

    it('should not sell more than available', () => {
        const tt = TicketType.create({
            id: '1', eventId: 'event-1', name: 'Passaporte',
            price: 199.90, quantity: 10,
        });
        expect(() => tt.sell(11)).toThrow('Only 10 tickets available');
    });
});
