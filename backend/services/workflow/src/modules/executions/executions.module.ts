import { Module } from '@nestjs/common';
import { ExecutionsService } from './executions.service';
import { ExecutionsController } from './executions.controller';
import { TriggersModule } from '../triggers/triggers.module';

@Module({
    imports: [TriggersModule],
    controllers: [ExecutionsController],
    providers: [ExecutionsService],
    exports: [ExecutionsService],
})
export class ExecutionsModule {}
