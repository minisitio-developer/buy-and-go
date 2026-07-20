import { EventAggregate } from './event.entity'

describe('EventAggregate', () => {
    const validProps = {
        organizationId: crypto.randomUUID(),
        name: 'Feira Agropecuária 2026',
        type: 'presential' as const,
        timezone: 'America/Sao_Paulo',
        startDate: new Date('2026-09-15'),
        endDate: new Date('2026-09-18'),
        createdBy: crypto.randomUUID(),
        slug: 'feira-agro-2026',
        capacity: 30000,
    }

    it('should create a draft event', () => {
        const event = EventAggregate.create(validProps)
        expect(event.currentState.status).toBe('draft')
    })

    it('should publish event', () => {
        const event = EventAggregate.create(validProps)
        event.publish()
        expect(event.currentState.status).toBe('published')
    })

    it('should not publish already published event', () => {
        const event = EventAggregate.create(validProps)
        event.publish()
        expect(() => event.publish()).toThrow('Only draft events can be published')
    })

    it('should cancel event', () => {
        const event = EventAggregate.create(validProps)
        event.publish()
        event.cancel()
        expect(event.currentState.status).toBe('cancelled')
    })

    it('should finish event', () => {
        const event = EventAggregate.create(validProps)
        event.publish()
        event.finish()
        expect(event.currentState.status).toBe('finished')
    })

    it('should not cancel finished event', () => {
        const event = EventAggregate.create(validProps)
        event.publish()
        event.finish()
        expect(() => event.cancel()).toThrow('Cannot cancel a finished event')
    })

    it('should record domain events on create', () => {
        const event = EventAggregate.create(validProps)
        const events = event.getUncommittedEvents()
        expect(events).toHaveLength(1)
        expect(events[0].eventType).toBe('EventCreated')
    })

    it('should record domain events on publish', () => {
        const event = EventAggregate.create(validProps)
        const uncommitted = event.getUncommittedEvents().length
        event.publish()
        expect(event.getUncommittedEvents()).toHaveLength(uncommitted + 1)
    })
})
