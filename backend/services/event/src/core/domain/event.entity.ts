import { AggregateRoot, StoredEvent } from '@eventos-ai/event-store'

export type EventType = 'presential' | 'hybrid' | 'online'
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'finished'
export type EventVisibility = 'public' | 'private' | 'restricted'

export interface EventState {
    id: string
    organizationId: string
    name: string
    slug: string
    description?: string
    type: EventType
    category?: string
    status: EventStatus
    visibility: EventVisibility
    timezone: string
    currency: string
    language: string
    startDate: string
    endDate: string
    capacity?: number
    city?: string
    state?: string
    country: string
    createdBy: string
    createdAt: string
    updatedAt: string
    deletedAt?: string
}

export class EventAggregate extends AggregateRoot {
    private state!: EventState

    constructor(id?: string) {
        super(id)
    }

    get aggregateType(): string {
        return 'event'
    }

    get currentState(): EventState {
        return { ...this.state }
    }

    static create(data: {
        organizationId: string
        name: string
        type: EventType
        timezone: string
        startDate: Date
        endDate: Date
        createdBy: string
        slug: string
        capacity?: number
        city?: string
        state?: string
    }): EventAggregate {
        const aggregate = new EventAggregate()
        const now = new Date().toISOString()

        aggregate.applyChange({
            eventType: 'EventCreated',
            data: {
                id: aggregate.id,
                organizationId: data.organizationId,
                name: data.name,
                slug: data.slug,
                type: data.type,
                timezone: data.timezone,
                startDate: data.startDate.toISOString(),
                endDate: data.endDate.toISOString(),
                capacity: data.capacity,
                city: data.city,
                state: data.state,
                createdBy: data.createdBy,
                createdAt: now,
                updatedAt: now,
            },
        })

        return aggregate
    }

    publish(): void {
        this.assertStatus('draft', 'Only draft events can be published')
        this.applyChange({
            eventType: 'EventPublished',
            data: { id: this.id, updatedAt: new Date().toISOString() },
        })
    }

    cancel(): void {
        this.assertNotStatus('finished', 'Cannot cancel a finished event')
        this.applyChange({
            eventType: 'EventCancelled',
            data: { id: this.id, updatedAt: new Date().toISOString() },
        })
    }

    finish(): void {
        this.assertStatus('published', 'Only published events can be finished')
        this.applyChange({
            eventType: 'EventFinished',
            data: { id: this.id, updatedAt: new Date().toISOString() },
        })
    }

    update(data: {
        name?: string
        description?: string
        capacity?: number
        city?: string
        state?: string
        startDate?: Date
        endDate?: Date
    }): void {
        const changes: Record<string, unknown> = { id: this.id, updatedAt: new Date().toISOString() }
        if (data.name !== undefined) changes.name = data.name
        if (data.description !== undefined) changes.description = data.description
        if (data.capacity !== undefined) changes.capacity = data.capacity
        if (data.city !== undefined) changes.city = data.city
        if (data.state !== undefined) changes.state = data.state
        if (data.startDate !== undefined) changes.startDate = data.startDate.toISOString()
        if (data.endDate !== undefined) changes.endDate = data.endDate.toISOString()

        this.applyChange({
            eventType: 'EventUpdated',
            data: changes,
        })
    }

    remove(): void {
        this.applyChange({
            eventType: 'EventRemoved',
            data: { id: this.id, deletedAt: new Date().toISOString() },
        })
    }

    get isDeleted(): boolean {
        return !!this.state?.deletedAt
    }

    restoreFromSnapshot(state: EventState, version: number): void {
        this.state = state
        this.version = version
    }

    protected mutate(event: StoredEvent): void {
        switch (event.eventType) {
            case 'EventCreated':
                this.state = {
                    ...this.state,
                    ...(event.data as any),
                    status: 'draft',
                    visibility: 'public',
                    currency: 'BRL',
                    language: 'pt-BR',
                    country: 'Brasil',
                }
                break
            case 'EventPublished':
                this.state.status = 'published'
                this.state.updatedAt = (event.data as any).updatedAt
                break
            case 'EventCancelled':
                this.state.status = 'cancelled'
                this.state.updatedAt = (event.data as any).updatedAt
                break
            case 'EventFinished':
                this.state.status = 'finished'
                this.state.updatedAt = (event.data as any).updatedAt
                break
            case 'EventUpdated':
                Object.assign(this.state, event.data)
                break
            case 'EventRemoved':
                this.state.deletedAt = (event.data as any).deletedAt
                break
        }
    }

    private assertStatus(expected: EventStatus, message: string): void {
        if (this.state?.status !== expected) {
            throw new Error(message)
        }
    }

    private assertNotStatus(forbidden: EventStatus, message: string): void {
        if (this.state?.status === forbidden) {
            throw new Error(message)
        }
    }
}
