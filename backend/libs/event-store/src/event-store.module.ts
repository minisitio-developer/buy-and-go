import { DynamicModule, Module, Provider } from '@nestjs/common'
import { EventStoreService } from './event-store.service'
import { EventStoreConfig } from './interfaces/event-store.interface'

@Module({})
export class EventStoreModule {
    static forRoot(config?: EventStoreConfig): DynamicModule {
        const providers: Provider[] = [
            {
                provide: 'EVENT_STORE_CONFIG',
                useValue: config ?? {},
            },
            {
                provide: EventStoreService,
                useFactory: () => new EventStoreService(config),
            },
        ]

        return {
            module: EventStoreModule,
            global: true,
            providers,
            exports: [EventStoreService],
        }
    }
}
