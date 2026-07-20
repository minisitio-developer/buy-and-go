import { Injectable, Logger } from '@nestjs/common'
import { DomainEvent } from '@eventos-ai/messaging'
import { Projection } from '../interfaces/projection.interface'

interface EventListing {
    id: string
    title: string
    description: string
    date: string
    location: string
    organizerId: string
    status: 'draft' | 'published' | 'cancelled'
    maxAttendees: number
    createdAt: string
    updatedAt: string
}

@Injectable()
export class EventListingsProjection implements Projection {
    readonly name = 'event-listings'
    readonly version = 1
    private readonly logger = new Logger(EventListingsProjection.name)
    private readonly listings: Map<string, EventListing> = new Map()

    async handler(event: DomainEvent): Promise<void> {
        switch (event.eventType) {
            case 'EventCreated':
                await this.handleEventCreated(event)
                break
            case 'EventUpdated':
                await this.handleEventUpdated(event)
                break
            case 'EventPublished':
                await this.handleEventPublished(event)
                break
            case 'EventCancelled':
                await this.handleEventCancelled(event)
                break
        }
    }

    async rebuild(): Promise<void> {
        this.listings.clear()
        this.logger.log('Event listings projection cleared for rebuild')
    }

    getAllListings(): EventListing[] {
        return Array.from(this.listings.values())
    }

    getListingById(id: string): EventListing | undefined {
        return this.listings.get(id)
    }

    private async handleEventCreated(event: DomainEvent): Promise<void> {
        const { aggregateId, title, description, date, location, organizerId, maxAttendees } = event.payload

        const listing: EventListing = {
            id: aggregateId as string,
            title: title as string,
            description: description as string,
            date: date as string,
            location: location as string,
            organizerId: organizerId as string,
            status: 'draft',
            maxAttendees: (maxAttendees as number) ?? 0,
            createdAt: event.timestamp.toISOString(),
            updatedAt: event.timestamp.toISOString(),
        }

        this.listings.set(listing.id, listing)
        this.logger.debug(`Listing created: ${listing.id} - ${listing.title}`)
    }

    private async handleEventUpdated(event: DomainEvent): Promise<void> {
        const listing = this.listings.get(event.payload.aggregateId as string)
        if (!listing) {
            this.logger.warn(`Listing not found for update: ${event.payload.aggregateId}`)
            return
        }

        if (event.payload.title !== undefined) listing.title = event.payload.title as string
        if (event.payload.description !== undefined) listing.description = event.payload.description as string
        if (event.payload.date !== undefined) listing.date = event.payload.date as string
        if (event.payload.location !== undefined) listing.location = event.payload.location as string
        if (event.payload.maxAttendees !== undefined) listing.maxAttendees = event.payload.maxAttendees as number
        listing.updatedAt = event.timestamp.toISOString()

        this.logger.debug(`Listing updated: ${listing.id}`)
    }

    private async handleEventPublished(event: DomainEvent): Promise<void> {
        const listing = this.listings.get(event.payload.aggregateId as string)
        if (!listing) {
            this.logger.warn(`Listing not found for publish: ${event.payload.aggregateId}`)
            return
        }

        listing.status = 'published'
        listing.updatedAt = event.timestamp.toISOString()
        this.logger.debug(`Listing published: ${listing.id}`)
    }

    private async handleEventCancelled(event: DomainEvent): Promise<void> {
        const listing = this.listings.get(event.payload.aggregateId as string)
        if (!listing) {
            this.logger.warn(`Listing not found for cancellation: ${event.payload.aggregateId}`)
            return
        }

        listing.status = 'cancelled'
        listing.updatedAt = event.timestamp.toISOString()
        this.logger.debug(`Listing cancelled: ${listing.id}`)
    }
}
