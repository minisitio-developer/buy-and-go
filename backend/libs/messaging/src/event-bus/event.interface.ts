export interface DomainEvent {
    eventId: string;
    eventType: string;
    source: string;
    timestamp: Date;
    correlationId: string;
    payload: Record<string, any>;
}
