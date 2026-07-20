import { Injectable, Logger } from '@nestjs/common';
import { EventBusService, TOPICS, DomainEvent } from '@eventos-ai/messaging';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SearchConsumer {
    private readonly logger = new Logger(SearchConsumer.name);

    constructor(
        private readonly eventBus: EventBusService,
        private readonly elasticsearch: ElasticsearchService,
        private readonly prisma: PrismaService,
    ) {}

    async onModuleInit(): Promise<void> {
        await this.eventBus.subscribe(
            TOPICS.ATTENDEE.CREATED,
            'search-attendee-created',
            this.handleAttendeeCreated.bind(this),
        );

        await this.eventBus.subscribe(
            TOPICS.ATTENDEE.UPDATED,
            'search-attendee-updated',
            this.handleAttendeeUpdated.bind(this),
        );

        await this.eventBus.subscribe(
            TOPICS.ATTENDEE.DELETED,
            'search-attendee-deleted',
            this.handleAttendeeDeleted.bind(this),
        );

        await this.eventBus.subscribe(
            TOPICS.CHECKIN.CREATED,
            'search-checkin-created',
            this.handleCheckinCreated.bind(this),
        );

        await this.eventBus.subscribe(
            TOPICS.EVENT.CREATED,
            'search-event-created',
            this.handleEventCreated.bind(this),
        );

        await this.eventBus.subscribe(
            TOPICS.EVENT.UPDATED,
            'search-event-updated',
            this.handleEventUpdated.bind(this),
        );

        await this.eventBus.subscribe(
            TOPICS.EVENT.DELETED,
            'search-event-deleted',
            this.handleEventDeleted.bind(this),
        );

        this.logger.log('Search consumers initialized');
    }

    private async handleAttendeeCreated(event: DomainEvent): Promise<void> {
        const { id, name, email, document, company, category, eventId, organizationId } = event.payload;
        this.logger.log(`Indexing attendee: ${id}`);

        try {
            await this.elasticsearch.index('attendee', id, {
                name, email, document, company, category, eventId, organizationId,
                type: 'attendee',
            });
        } catch (error) {
            this.logger.error(`Error indexing attendee ${id}`, error);
        }
    }

    private async handleAttendeeUpdated(event: DomainEvent): Promise<void> {
        const { id, name, email, document, company, category } = event.payload;
        this.logger.log(`Updating attendee index: ${id}`);

        try {
            await this.elasticsearch.update('attendee', id, {
                name, email, document, company, category,
            });
        } catch (error) {
            this.logger.error(`Error updating attendee index ${id}`, error);
        }
    }

    private async handleAttendeeDeleted(event: DomainEvent): Promise<void> {
        const { id } = event.payload;
        this.logger.log(`Removing attendee from index: ${id}`);

        try {
            await this.elasticsearch.remove('attendee', id);
        } catch (error) {
            this.logger.error(`Error removing attendee from index ${id}`, error);
        }
    }

    private async handleCheckinCreated(event: DomainEvent): Promise<void> {
        const { id, attendeeId, eventId, method, createdAt } = event.payload;
        this.logger.log(`Indexing checkin: ${id}`);

        try {
            await this.elasticsearch.index('checkin', id, {
                attendeeId, eventId, method, createdAt,
                type: 'checkin',
            });
        } catch (error) {
            this.logger.error(`Error indexing checkin ${id}`, error);
        }
    }

    private async handleEventCreated(event: DomainEvent): Promise<void> {
        const { id, name, description, organizationId, startDate, endDate } = event.payload;
        this.logger.log(`Indexing event: ${id}`);

        try {
            await this.elasticsearch.index('event', id, {
                name, description, organizationId, startDate, endDate,
                type: 'event',
            });
        } catch (error) {
            this.logger.error(`Error indexing event ${id}`, error);
        }
    }

    private async handleEventUpdated(event: DomainEvent): Promise<void> {
        const { id, name, description, startDate, endDate } = event.payload;
        this.logger.log(`Updating event index: ${id}`);

        try {
            await this.elasticsearch.update('event', id, {
                name, description, startDate, endDate,
            });
        } catch (error) {
            this.logger.error(`Error updating event index ${id}`, error);
        }
    }

    private async handleEventDeleted(event: DomainEvent): Promise<void> {
        const { id } = event.payload;
        this.logger.log(`Removing event from index: ${id}`);

        try {
            await this.elasticsearch.remove('event', id);
        } catch (error) {
            this.logger.error(`Error removing event from index ${id}`, error);
        }
    }
}
