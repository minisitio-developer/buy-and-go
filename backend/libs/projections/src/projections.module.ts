import { DynamicModule, Module } from '@nestjs/common'
import { ProjectionEngineService } from './projection-engine.service'

export interface ProjectionsModuleOptions {
    pollingIntervalMs?: number
    global?: boolean
}

@Module({})
export class ProjectionsModule {
    static forRoot(options?: ProjectionsModuleOptions): DynamicModule {
        return {
            module: ProjectionsModule,
            global: options?.global ?? true,
            providers: [
                {
                    provide: 'PROJECTION_ENGINE_OPTIONS',
                    useValue: { pollingIntervalMs: options?.pollingIntervalMs ?? 1000 },
                },
                ProjectionEngineService,
            ],
            exports: [ProjectionEngineService],
        }
    }
}
