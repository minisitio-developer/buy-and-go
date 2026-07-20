import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AiNetworkingService } from './ai-networking.service';
import { AiNetworkingController } from './ai-networking.controller';

@Module({
    imports: [HttpModule, ConfigModule],
    controllers: [AiNetworkingController],
    providers: [AiNetworkingService],
    exports: [AiNetworkingService],
})
export class AiNetworkingModule {}
