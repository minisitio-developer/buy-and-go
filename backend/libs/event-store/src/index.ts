export { EventStoreModule } from './event-store.module'
export { EventStoreService } from './event-store.service'
export { ConcurrencyError } from './event-store.service'
export { AggregateRoot } from './aggregate-root'
export type {
    IEventStore,
    StoredEvent,
    DomainEventPayload,
    ISnapshot,
    EventStoreConfig,
    LoadEventsOptions,
} from './interfaces/event-store.interface'
