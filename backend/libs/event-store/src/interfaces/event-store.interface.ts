export interface StoredEvent {
    id: string
    aggregateType: string
    aggregateId: string
    version: number
    eventType: string
    data: Record<string, unknown>
    metadata?: Record<string, unknown> | null
    correlationId?: string | null
    causationId?: string | null
    recordedAt: Date
}

export interface EventStoreConfig {
    snapshotFrequency?: number
}

export interface LoadEventsOptions {
    aggregateType: string
    aggregateId: string
    fromVersion?: number
    toVersion?: number
}

export interface ISnapshot {
    id: string
    aggregateType: string
    aggregateId: string
    version: number
    state: Record<string, unknown>
    recordedAt: Date
}

export interface DomainEventPayload {
    eventType: string
    data: Record<string, unknown>
    metadata?: Record<string, unknown>
    correlationId?: string
    causationId?: string
}

export interface IEventStore {
    append(
        aggregateType: string,
        aggregateId: string,
        expectedVersion: number,
        events: DomainEventPayload[],
    ): Promise<void>

    loadStream(aggregateType: string, aggregateId: string): Promise<StoredEvent[]>

    loadEvents(options: LoadEventsOptions): Promise<StoredEvent[]>

    saveSnapshot(
        aggregateType: string,
        aggregateId: string,
        version: number,
        state: Record<string, unknown>,
    ): Promise<void>

    loadSnapshot(
        aggregateType: string,
        aggregateId: string,
    ): Promise<ISnapshot | null>

    getCurrentVersion(aggregateType: string, aggregateId: string): Promise<number>

    listAggregates(aggregateType: string): Promise<string[]>
}
