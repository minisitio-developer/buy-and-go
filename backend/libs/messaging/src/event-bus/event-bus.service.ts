import { Injectable, Inject, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer, KafkaConfig } from 'kafkajs';
import { randomUUID } from 'crypto';
import { DomainEvent } from './event.interface';
import { EventBusProducer } from './event-bus.producer';

@Injectable()
export class EventBusService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(EventBusService.name);
    private consumers: Consumer[] = [];

    constructor(
        @Inject('KAFKA_CONFIG') private readonly config: KafkaConfig,
        private readonly producer: EventBusProducer,
    ) {}

    async onModuleInit(): Promise<void> {
        await this.producer.connect();
    }

    async onModuleDestroy(): Promise<void> {
        await this.producer.disconnect();
        await Promise.allSettled(this.consumers.map(c => c.disconnect()));
        this.logger.log(`Disconnected ${this.consumers.length} consumer(s)`);
    }

    async publish(topic: string, eventType: string, payload: Record<string, any>, correlationId?: string): Promise<void> {
        const event: DomainEvent = {
            eventId: randomUUID(),
            eventType,
            source: this.config.clientId || 'eventos-ai',
            timestamp: new Date(),
            correlationId: correlationId || randomUUID(),
            payload,
        };

        await this.producer.produce(topic, event);
    }

    async subscribe(
        topic: string,
        groupId: string,
        handler: (event: DomainEvent) => Promise<void>,
    ): Promise<void> {
        const kafka = new Kafka({ ...this.config });
        const consumer = kafka.consumer({ groupId });

        try {
            await consumer.connect();
            await consumer.subscribe({ topic, fromBeginning: false });
            await consumer.run({
                eachMessage: async ({ message }) => {
                    try {
                        if (!message.value) return;
                        const event: DomainEvent = JSON.parse(message.value.toString());
                        await handler(event);
                    } catch (error) {
                        this.logger.error(`Error processing message from ${topic}`, error);
                    }
                },
            });

            this.consumers.push(consumer);
            this.logger.log(`Subscribed to ${topic} with group ${groupId}`);
        } catch (error) {
            this.logger.error(`Failed to subscribe to ${topic}`, error);
            await consumer.disconnect().catch(() => {});
            throw error;
        }
    }
}
