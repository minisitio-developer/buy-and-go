export class CheckIn {
    private duplicate = false;

    private constructor(
        private readonly props: {
            attendeeId: string;
            eventId: string;
            method: string;
            checkedInAt: Date;
        },
    ) {}

    static create(data: { attendeeId: string; eventId: string; method: string }): CheckIn {
        return new CheckIn({
            attendeeId: data.attendeeId,
            eventId: data.eventId,
            method: data.method,
            checkedInAt: new Date(),
        });
    }

    get status(): string {
        return this.duplicate ? 'duplicate' : 'approved';
    }

    get method(): string {
        return this.props.method;
    }

    markDuplicate(): void {
        throw new Error('Attendee already checked in');
    }
}
