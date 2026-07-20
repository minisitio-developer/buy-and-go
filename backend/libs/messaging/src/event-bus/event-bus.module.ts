import { DynamicModule, Module } from '@nestjs/common';
import { EventBusService } from './event-bus.service';
import { EventBusProducer } from './event-bus.producer';

export interface EventBusModuleOptions {
    clientId?: string;
    brokers?: string[];
    retry?: { retries?: number; initialRetryTime?: number };
    global?: boolean;
}

@Module({})
export class EventBusModule {
    static forRoot(options?: EventBusModuleOptions): DynamicModule {
        const kafkaConfig = {
            clientId: options?.clientId || process.env.KAFKA_CLIENT_ID || 'eventos-ai',
            brokers: options?.brokers || (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
            retry: options?.retry ?? { retries: 10, initialRetryTime: 300 },
        };

        return {
            module: EventBusModule,
            global: options?.global ?? true,
            providers: [
                { provide: 'KAFKA_CONFIG', useValue: kafkaConfig },
                EventBusService,
                EventBusProducer,
            ],
            exports: [EventBusService, EventBusProducer],
        };
    }
}
