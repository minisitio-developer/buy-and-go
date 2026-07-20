import { Injectable, Inject, Logger } from '@nestjs/common';
import { Kafka, Producer, KafkaConfig } from 'kafkajs';
import { DomainEvent } from './event.interface';

@Injectable()
export class EventBusProducer {
    private readonly logger = new Logger(EventBusProducer.name);
    private readonly producer: Producer;

    constructor(@Inject('KAFKA_CONFIG') private readonly config: KafkaConfig) {
        const kafka = new Kafka({ ...this.config });
        this.producer = kafka.producer();
    }

    async connect(): Promise<void> {
        try {
            await this.producer.connect();
            this.logger.log('Kafka producer connected');
        } catch (error) {
            this.logger.error('Failed to connect Kafka producer', error);
            throw error;
        }
    }

    async produce(topic: string, event: DomainEvent): Promise<void> {
        try {
            await this.producer.send({
                topic,
                messages: [
                    {
                        key: event.correlationId,
                        value: JSON.stringify(event),
                        headers: {
                            eventType: event.eventType,
                            source: event.source,
                            correlationId: event.correlationId,
                        },
                    },
                ],
            });
            this.logger.debug(`Event ${event.eventType} published to ${topic}`);
        } catch (error) {
            this.logger.error(`Failed to publish event ${event.eventType} to ${topic}`, error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        try {
            await this.producer.disconnect();
            this.logger.log('Kafka producer disconnected');
        } catch (error) {
            this.logger.error('Failed to disconnect Kafka producer', error);
        }
    }
}
