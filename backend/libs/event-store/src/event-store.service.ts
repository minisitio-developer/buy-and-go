import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import {
    IEventStore,
    StoredEvent,
    DomainEventPayload,
    ISnapshot,
    LoadEventsOptions,
} from './interfaces/event-store.interface'

@Injectable()
export class EventStoreService implements IEventStore, OnModuleInit {
    private readonly logger = new Logger(EventStoreService.name)
    private readonly prisma: PrismaClient
    private readonly snapshotFrequency: number

    constructor(config?: { snapshotFrequency?: number }) {
        this.prisma = new PrismaClient()
        this.snapshotFrequency = config?.snapshotFrequency ?? 50
    }

    async onModuleInit(): Promise<void> {
        await this.prisma.$connect()
        this.logger.log('EventStore connected to database')
    }

    async append(
        aggregateType: string,
        aggregateId: string,
        expectedVersion: number,
        events: DomainEventPayload[],
    ): Promise<void> {
        const streamEntries = events.map((event, index) => ({
            id: randomUUID(),
            aggregateType,
            aggregateId,
            version: expectedVersion + index + 1,
            eventType: event.eventType,
            data: event.data as Record<string, unknown>,
            metadata: (event.metadata as Record<string, unknown>) ?? null,
            correlationId: event.correlationId ?? null,
            causationId: event.causationId ?? null,
        }))

        try {
            await this.prisma.$transaction(async (tx) => {
                const currentVersion = await this.getCurrentVersionTx(tx, aggregateType, aggregateId)

                if (currentVersion !== expectedVersion) {
                    throw new ConcurrencyError(
                        aggregateType,
                        aggregateId,
                        expectedVersion,
                        currentVersion,
                    )
                }

                for (const entry of streamEntries) {
                    await tx.eventStream.create({ data: entry })
                }
            })

            this.logger.debug(`Appended ${events.length} event(s) to ${aggregateType}:${aggregateId} (v${expectedVersion + 1})`)
        } catch (error) {
            if (error instanceof ConcurrencyError) {
                throw error
            }
            this.logger.error(`Failed to append events to ${aggregateType}:${aggregateId}`, error)
            throw error
        }
    }

    async loadStream(aggregateType: string, aggregateId: string): Promise<StoredEvent[]> {
        const events = await this.prisma.eventStream.findMany({
            where: { aggregateType, aggregateId },
            orderBy: { version: 'asc' },
        })

        return events.map(this.mapToStoredEvent)
    }

    async loadEvents(options: LoadEventsOptions): Promise<StoredEvent[]> {
        const events = await this.prisma.eventStream.findMany({
            where: {
                aggregateType: options.aggregateType,
                aggregateId: options.aggregateId,
                ...(options.fromVersion !== undefined && { version: { gte: options.fromVersion } }),
                ...(options.toVersion !== undefined && { version: { lte: options.toVersion } }),
            },
            orderBy: { version: 'asc' },
        })

        return events.map(this.mapToStoredEvent)
    }

    async saveSnapshot(
        aggregateType: string,
        aggregateId: string,
        version: number,
        state: Record<string, unknown>,
    ): Promise<void> {
        await this.prisma.snapshot.upsert({
            where: {
                aggregateType_aggregateId_version: {
                    aggregateType,
                    aggregateId,
                    version,
                },
            },
            create: { aggregateType, aggregateId, version, state },
            update: { state, recordedAt: new Date() },
        })

        this.logger.debug(`Snapshot saved for ${aggregateType}:${aggregateId} @ v${version}`)
    }

    async loadSnapshot(
        aggregateType: string,
        aggregateId: string,
    ): Promise<ISnapshot | null> {
        const snapshot = await this.prisma.snapshot.findFirst({
            where: { aggregateType, aggregateId },
            orderBy: { version: 'desc' },
        })

        if (!snapshot) return null

        return {
            id: snapshot.id,
            aggregateType: snapshot.aggregateType,
            aggregateId: snapshot.aggregateId,
            version: snapshot.version,
            state: snapshot.state as Record<string, unknown>,
            recordedAt: snapshot.recordedAt,
        }
    }

    async getCurrentVersion(aggregateType: string, aggregateId: string): Promise<number> {
        return this.getCurrentVersionTx(this.prisma, aggregateType, aggregateId)
    }

    async listAggregates(aggregateType: string): Promise<string[]> {
        const result = await this.prisma.eventStream.findMany({
            where: { aggregateType },
            select: { aggregateId: true },
            distinct: ['aggregateId'],
        })

        return result.map((r) => r.aggregateId)
    }

    private async getCurrentVersionTx(
        tx: any,
        aggregateType: string,
        aggregateId: string,
    ): Promise<number> {
        const last = await tx.eventStream.findFirst({
            where: { aggregateType, aggregateId },
            orderBy: { version: 'desc' },
            select: { version: true },
        })

        return last?.version ?? 0
    }

    private mapToStoredEvent(event: any): StoredEvent {
        return {
            id: event.id,
            aggregateType: event.aggregateType,
            aggregateId: event.aggregateId,
            version: event.version,
            eventType: event.eventType,
            data: event.data as Record<string, unknown>,
            metadata: event.metadata as Record<string, unknown> | null,
            correlationId: event.correlationId,
            causationId: event.causationId,
            recordedAt: event.recordedAt,
        }
    }
}

export class ConcurrencyError extends Error {
    constructor(
        public aggregateType: string,
        public aggregateId: string,
        public expectedVersion: number,
        public actualVersion: number,
    ) {
        super(
            `Concurrency conflict on ${aggregateType}:${aggregateId}. Expected v${expectedVersion}, actual v${actualVersion}`,
        )
        this.name = 'ConcurrencyError'
    }
}
