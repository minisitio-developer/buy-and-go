import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AiClient } from './ai.client';

@Global()
@Module({
    imports: [HttpModule, ConfigModule],
    providers: [AiClient],
    exports: [AiClient],
})
export class AiClientModule {}
