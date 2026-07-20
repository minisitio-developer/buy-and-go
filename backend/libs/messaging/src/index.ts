export { EventBusModule, type EventBusModuleOptions } from './event-bus/event-bus.module';
export { EventBusService } from './event-bus/event-bus.service';
export { EventBusProducer } from './event-bus/event-bus.producer';
export type { DomainEvent } from './event-bus/event.interface';
export { TOPICS } from './topics/topics';
export type {
    CheckinCreatedEvent,
    CheckinVerifiedEvent,
    AttendeeSyncedEvent,
} from './schemas/checkin.events';
export type {
    OrderCreatedEvent,
    OrderConfirmedEvent,
    OrderRefundedEvent,
    TicketIssuedEvent,
} from './schemas/ticket.events';
export type {
    DealCreatedEvent,
    DealMovedEvent,
    DealClosedEvent,
    ContactCreatedEvent,
} from './schemas/crm.events';
export type {
    PaymentCompletedEvent,
    PaymentFailedEvent,
    PaymentRefundedEvent,
} from './schemas/payment.events';
