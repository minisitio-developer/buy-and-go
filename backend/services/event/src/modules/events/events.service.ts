import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common'
import slugify from 'slugify'
import { EventStoreService, ConcurrencyError } from '@eventos-ai/event-store'
import { EventAggregate, EventStatus } from '../../core/domain/event.entity'

@Injectable()
export class EventsService {
    private readonly logger = new Logger(EventsService.name)

    constructor(private readonly eventStore: EventStoreService) {}

    async create(data: {
        organizationId: string
        name: string
        type: string
        timezone: string
        startDate: string
        endDate: string
        capacity?: number
        city?: string
        state?: string
        createdBy: string
    }): Promise<Record<string, unknown>> {
        const slug = slugify(data.name, { lower: true, strict: true }) + '-' + Date.now()

        const existingVersions = await this.eventStore.getCurrentVersion('event', slug)
        if (existingVersions > 0) {
            throw new ConflictException('Event with similar name already exists')
        }

        const aggregate = EventAggregate.create({
            organizationId: data.organizationId,
            name: data.name,
            type: data.type as any,
            timezone: data.timezone,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            capacity: data.capacity,
            city: data.city,
            state: data.state,
            createdBy: data.createdBy,
            slug,
        })

        const events = aggregate.getUncommittedEvents()
        const state = aggregate.currentState

        await this.eventStore.append('event', slug, 0, events)
        aggregate.clearUncommittedEvents()

        await this.trySaveSnapshot(aggregate)

        this.logger.log(`Event created: ${slug} (${aggregate.id})`)

        return { ...state, type: state.type, status: state.status }
    }

    async findAll(params: {
        organizationId?: string
        status?: string
        city?: string
        page?: number
        perPage?: number
    }): Promise<{ data: Record<string, unknown>[]; pagination: { page: number; perPage: number; total: number; totalPages: number } }> {
        const { organizationId, status, city, page = 1, perPage = 20 } = params

        const aggregateIds = await this.eventStore.listAggregates('event')
        const result: Record<string, unknown>[] = []

        for (const slug of aggregateIds) {
            const snapshot = await this.eventStore.loadSnapshot('event', slug)

            if (!snapshot) {
                const events = await this.eventStore.loadStream('event', slug)
                if (events.length === 0) continue

                const agg = new EventAggregate()
                agg.loadFromHistory(events)
                const state = agg.currentState

                if (state.deletedAt) continue
                if (organizationId && state.organizationId !== organizationId) continue
                if (status && state.status !== status) continue
                if (city && !state.city?.toLowerCase().includes(city.toLowerCase())) continue

                result.push(state)
            } else {
                const state = snapshot.state as any
                if (state.deletedAt) continue
                if (organizationId && state.organizationId !== organizationId) continue
                if (status && state.status !== status) continue
                if (city && !state.city?.toLowerCase().includes(city.toLowerCase())) continue

                result.push(state)
            }
        }

        const sorted = result.sort(
            (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )

        const total = sorted.length
        const paginated = sorted.slice((page - 1) * perPage, page * perPage)

        return {
            data: paginated,
            pagination: {
                page,
                perPage,
                total,
                totalPages: Math.ceil(total / perPage),
            },
        }
    }

    async findById(id: string): Promise<Record<string, unknown>> {
        const aggregates = await this.eventStore.listAggregates('event')

        for (const slug of aggregates) {
            const snapshot = await this.eventStore.loadSnapshot('event', slug)
            if (snapshot && (snapshot.state as any).id === id) {
                if ((snapshot.state as any).deletedAt) {
                    throw new NotFoundException('Event not found')
                }
                return snapshot.state as Record<string, unknown>
            }
        }

        const streams = aggregates
        for (const slug of streams) {
            const events = await this.eventStore.loadStream('event', slug)
            if (events.length === 0) continue

            const agg = new EventAggregate()
            agg.loadFromHistory(events)

            if (agg.id === id) {
                if (agg.isDeleted) {
                    throw new NotFoundException('Event not found')
                }
                return agg.currentState
            }
        }

        throw new NotFoundException('Event not found')
    }

    async update(
        id: string,
        data: {
            name?: string
            description?: string
            capacity?: number
            city?: string
            state?: string
            startDate?: string
            endDate?: string
        },
    ): Promise<Record<string, unknown>> {
        const agg = await this.loadAggregate(id)

        agg.update({
            name: data.name,
            description: data.description,
            capacity: data.capacity,
            city: data.city,
            state: data.state,
            ...(data.startDate && { startDate: new Date(data.startDate) }),
            ...(data.endDate && { endDate: new Date(data.endDate) }),
        })

        const events = agg.getUncommittedEvents()
        await this.eventStore.append('event', agg.currentState.slug, agg.version - events.length, events)
        agg.clearUncommittedEvents()
        await this.trySaveSnapshot(agg)

        return agg.currentState
    }

    async publish(id: string): Promise<Record<string, unknown>> {
        const agg = await this.loadAggregate(id)
        agg.publish()

        const events = agg.getUncommittedEvents()
        await this.eventStore.append('event', agg.currentState.slug, agg.version - events.length, events)
        agg.clearUncommittedEvents()
        await this.trySaveSnapshot(agg)

        return agg.currentState
    }

    async cancel(id: string): Promise<Record<string, unknown>> {
        const agg = await this.loadAggregate(id)
        agg.cancel()

        const events = agg.getUncommittedEvents()
        await this.eventStore.append('event', agg.currentState.slug, agg.version - events.length, events)
        agg.clearUncommittedEvents()
        await this.trySaveSnapshot(agg)

        return agg.currentState
    }

    async duplicate(id: string): Promise<Record<string, unknown>> {
        const agg = await this.loadAggregate(id)
        const state = agg.currentState

        const slug = slugify(state.name, { lower: true, strict: true }) + '-copia-' + Date.now()

        const newAgg = EventAggregate.create({
            organizationId: state.organizationId,
            name: state.name + ' (cópia)',
            type: state.type,
            timezone: state.timezone,
            startDate: new Date(state.startDate),
            endDate: new Date(state.endDate),
            capacity: state.capacity,
            city: state.city,
            state: state.state,
            createdBy: state.createdBy,
            slug,
        })

        const events = newAgg.getUncommittedEvents()
        const newState = newAgg.currentState
        await this.eventStore.append('event', slug, 0, events)
        newAgg.clearUncommittedEvents()
        await this.trySaveSnapshot(newAgg)

        return newState
    }

    async remove(id: string): Promise<void> {
        const agg = await this.loadAggregate(id)
        agg.remove()

        const events = agg.getUncommittedEvents()
        await this.eventStore.append('event', agg.currentState.slug, agg.version - events.length, events)
        agg.clearUncommittedEvents()
        await this.trySaveSnapshot(agg)
    }

    private async trySaveSnapshot(aggregate: EventAggregate): Promise<void> {
        const state = aggregate.currentState
        if (aggregate.version % 20 === 0) {
            await this.eventStore.saveSnapshot('event', state.slug, aggregate.version, state as any)
            this.logger.debug(`Snapshot saved for event ${state.slug} @ v${aggregate.version}`)
        }
    }

    private async loadAggregate(id: string): Promise<EventAggregate> {
        const aggregates = await this.eventStore.listAggregates('event')

        for (const slug of aggregates) {
            const snapshot = await this.eventStore.loadSnapshot('event', slug)
            if (snapshot && (snapshot.state as any).id === id) {
                if ((snapshot.state as any).deletedAt) {
                    throw new NotFoundException('Event not found')
                }

                const remainingEvents = await this.eventStore.loadEvents({
                    aggregateType: 'event',
                    aggregateId: slug,
                    fromVersion: snapshot.version + 1,
                })

                const agg = new EventAggregate(id)
                agg.restoreFromSnapshot(snapshot.state as any, snapshot.version)
                agg.loadFromHistory(remainingEvents)
                return agg
            }
        }

        for (const slug of aggregates) {
            const events = await this.eventStore.loadStream('event', slug)
            if (events.length === 0) continue

            const agg = new EventAggregate()
            agg.loadFromHistory(events)

            if (agg.id === id) {
                if (agg.isDeleted) {
                    throw new NotFoundException('Event not found')
                }
                return agg
            }
        }

        throw new NotFoundException('Event not found')
    }
}
