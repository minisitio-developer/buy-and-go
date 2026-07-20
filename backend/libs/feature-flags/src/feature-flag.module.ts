import { DynamicModule, Module, Provider } from '@nestjs/common';
import { FeatureFlagClient, FeatureFlagClientOptions } from './feature-flag.client';

@Module({})
export class FeatureFlagModule {
    static forRoot(options: FeatureFlagClientOptions = {}): DynamicModule {
        const providers: Provider[] = [
            {
                provide: 'FEATURE_FLAG_OPTIONS',
                useValue: options,
            },
            {
                provide: FeatureFlagClient,
                useFactory: () => new FeatureFlagClient(options),
            },
        ];

        return {
            module: FeatureFlagModule,
            global: true,
            providers,
            exports: [FeatureFlagClient],
        };
    }
}
