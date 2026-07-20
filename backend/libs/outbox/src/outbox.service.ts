import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { Kafka, Producer } from 'kafkajs'
import { randomUUID } from 'crypto'
import { DomainEvent } from '@eventos-ai/messaging'

@Injectable()
export class OutboxService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(OutboxService.name)
    private readonly prisma: PrismaClient
    private readonly kafka: Kafka
    private readonly producer: Producer
    private pollingInterval: ReturnType<typeof setInterval> | null = null
    private isProcessing = false
    private readonly config: {
        pollingIntervalMs: number
        batchSize: number
        clientId: string
    }

    constructor(options?: {
        pollingIntervalMs?: number
        batchSize?: number
        clientId?: string
        brokers?: string[]
    }) {
        this.prisma = new PrismaClient()
        this.config = {
            pollingIntervalMs: options?.pollingIntervalMs ?? 1000,
            batchSize: options?.batchSize ?? 50,
            clientId: options?.clientId ?? 'outbox-worker',
        }
        const brokers = options?.brokers || (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
        this.kafka = new Kafka({
            clientId: this.config.clientId,
            brokers,
        })
        this.producer = this.kafka.producer()
    }

    async onModuleInit(): Promise<void> {
        await this.prisma.$connect()
        await this.producer.connect()
        this.startPolling()
        this.logger.log('Outbox worker started')
    }

    async onModuleDestroy(): Promise<void> {
        this.stopPolling()
        await this.producer.disconnect()
        await this.prisma.$disconnect()
    }

    startPolling(): void {
        if (this.pollingInterval) return
        this.pollingInterval = setInterval(
            () => this.processPendingMessages(),
            this.config.pollingIntervalMs,
        )
    }

    stopPolling(): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval)
            this.pollingInterval = null
        }
    }

    private async processPendingMessages(): Promise<void> {
        if (this.isProcessing) return
        this.isProcessing = true

        try {
            const messages = await this.claimMessages()

            for (const message of messages) {
                try {
                    const topic = this.resolveTopic(message.eventType)

                    const domainEvent: DomainEvent = {
                        eventId: message.id,
                        eventType: message.eventType,
                        source: this.config.clientId,
                        timestamp: new Date(),
                        correlationId: message.correlationId || randomUUID(),
                        payload: {
                            aggregateType: message.aggregateType,
                            aggregateId: message.aggregateId,
                            data: message.data,
                            metadata: message.metadata,
                        },
                    }

                    await this.producer.send({
                        topic,
                        messages: [{
                            key: domainEvent.correlationId,
                            value: JSON.stringify(domainEvent),
                            headers: {
                                eventType: message.eventType,
                                source: this.config.clientId,
                                correlationId: domainEvent.correlationId,
                            },
                        }],
                    })

                    await this.prisma.outboxMessage.update({
                        where: { id: message.id },
                        data: {
                            status: 'published',
                            publishedAt: new Date(),
                            lockedAt: null,
                            lockedBy: null,
                        },
                    })

                    this.logger.debug(`Published outbox message ${message.id} (${message.eventType})`)
                } catch (error: any) {
                    this.logger.error(`Failed to publish message ${message.id}`, error)

                    const newRetryCount = message.retryCount + 1
                    if (newRetryCount >= message.maxRetries) {
                        await this.prisma.outboxMessage.update({
                            where: { id: message.id },
                            data: {
                                status: 'failed',
                                retryCount: newRetryCount,
                                lastError: error.message,
                                lockedAt: null,
                                lockedBy: null,
                            },
                        })
                    } else {
                        await this.prisma.outboxMessage.update({
                            where: { id: message.id },
                            data: {
                                retryCount: newRetryCount,
                                lastError: error.message,
                                lockedAt: null,
                                lockedBy: null,
                            },
                        })
                    }
                }
            }
        } catch (error) {
            this.logger.error('Error processing outbox', error)
        } finally {
            this.isProcessing = false
        }
    }

    private async claimMessages(): Promise<any[]> {
        const now = new Date()
        const lockId = randomUUID()
        const batchSize = this.config.batchSize

        await this.prisma.$executeRawUnsafe(`
            UPDATE outbox_messages
            SET locked_at = $1, locked_by = $2
            WHERE id IN (
                SELECT id FROM outbox_messages
                WHERE status = 'pending'
                  AND (locked_at IS NULL OR locked_at < $3)
                  AND retry_count < max_retries
                ORDER BY created_at ASC
                LIMIT $4
                FOR UPDATE SKIP LOCKED
            )
        `, now, lockId, new Date(now.getTime() - 30000), batchSize)

        const messages = await this.prisma.outboxMessage.findMany({
            where: { lockedBy: lockId },
            orderBy: { createdAt: 'asc' },
        })

        return messages
    }

    async save(
        aggregateType: string,
        aggregateId: string,
        eventType: string,
        data: Record<string, unknown>,
        metadata?: Record<string, unknown>,
        correlationId?: string,
        causationId?: string,
    ): Promise<void> {
        await this.prisma.outboxMessage.create({
            data: {
                aggregateType,
                aggregateId,
                eventType,
                data: data as any,
                metadata: (metadata as any) ?? undefined,
                correlationId,
                causationId,
            },
        })
    }

    private resolveTopic(eventType: string): string {
        const parts = eventType.split('.')
        if (parts.length > 1) {
            return parts.slice(0, -1).join('.')
        }
        return 'events'
    }
}
