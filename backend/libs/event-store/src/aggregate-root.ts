import { randomUUID } from 'crypto'
import { DomainEventPayload } from './interfaces/event-store.interface'

export abstract class AggregateRoot {
    public readonly id: string
    public version: number = 0
    private uncommittedEvents: DomainEventPayload[] = []

    constructor(id?: string) {
        this.id = id || randomUUID()
    }

    abstract get aggregateType(): string

    protected applyChange(event: DomainEventPayload): void {
        this.uncommittedEvents.push(event)
        this.version++
    }

    getUncommittedEvents(): DomainEventPayload[] {
        return [...this.uncommittedEvents]
    }

    clearUncommittedEvents(): void {
        this.uncommittedEvents = []
    }

    loadFromHistory(events: StoredEvent[]): void {
        for (const event of events) {
            this.mutate(event)
            this.version = event.version
        }
    }

    protected abstract mutate(event: StoredEvent): void
}

interface StoredEvent {
    eventType: string
    data: Record<string, unknown>
    metadata?: Record<string, unknown> | null
    version: number
}
