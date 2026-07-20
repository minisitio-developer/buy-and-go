export class TicketType {
    private constructor(
        private readonly props: {
            id: string;
            eventId: string;
            name: string;
            price: number;
            quantity: number;
            sold: number;
            status: string;
        },
    ) {}

    static create(data: {
        id: string;
        eventId: string;
        name: string;
        price: number;
        quantity: number;
    }): TicketType {
        return new TicketType({
            ...data,
            sold: 0,
            status: 'active',
        });
    }

    get status(): string {
        return this.props.status;
    }

    get sold(): number {
        return this.props.sold;
    }

    get available(): number {
        return this.props.quantity - this.props.sold;
    }

    sell(quantity: number): void {
        if (quantity > this.available) {
            throw new Error(`Only ${this.available} tickets available for ${this.props.name}`);
        }
        this.props.sold += quantity;
        if (this.props.sold >= this.props.quantity) {
            this.props.status = 'sold_out';
        }
    }
}
