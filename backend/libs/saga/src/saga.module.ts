import { DynamicModule, Module, Provider } from '@nestjs/common'
import { SagaOrchestratorService } from './saga-orchestrator.service'
import { SagaOptions } from './interfaces/saga.interface'

@Module({})
export class SagaModule {
    static forRoot(options?: SagaOptions): DynamicModule {
        const sagaOptions = {
            defaultStepTimeout: options?.defaultStepTimeout ?? 30000,
            defaultRetries: options?.defaultRetries ?? 0,
            defaultRetryDelay: options?.defaultRetryDelay ?? 1000,
        }

        const providers: Provider[] = [
            {
                provide: 'SAGA_OPTIONS',
                useValue: sagaOptions,
            },
            {
                provide: SagaOrchestratorService,
                useFactory: () => new SagaOrchestratorService(sagaOptions),
            },
        ]

        return {
            module: SagaModule,
            global: options?.global ?? true,
            providers,
            exports: [SagaOrchestratorService],
        }
    }
}
