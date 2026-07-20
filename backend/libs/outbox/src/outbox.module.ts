import { DynamicModule, Module, Provider } from '@nestjs/common'
import { OutboxService } from './outbox.service'
import { InboxService } from './inbox.service'

export interface OutboxModuleOptions {
    pollingIntervalMs?: number
    batchSize?: number
    clientId?: string
}

@Module({})
export class OutboxModule {
    static forRoot(options?: OutboxModuleOptions): DynamicModule {
        const providers: Provider[] = [
            {
                provide: 'OUTBOX_CONFIG',
                useValue: options ?? {},
            },
            {
                provide: OutboxService,
                useFactory: () =>
                    new OutboxService({
                        pollingIntervalMs: options?.pollingIntervalMs,
                        batchSize: options?.batchSize,
                        clientId: options?.clientId,
                    }),
            },
            InboxService,
        ]

        return {
            module: OutboxModule,
            global: true,
            providers,
            exports: [OutboxService, InboxService],
        }
    }
}
