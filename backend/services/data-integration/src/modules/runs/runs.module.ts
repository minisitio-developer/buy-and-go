import { Module } from '@nestjs/common';
import { RunsService } from './runs.service';
import { RunsController } from './runs.controller';
import { SyncModule } from '../sync/sync.module';

@Module({
    imports: [SyncModule],
    controllers: [RunsController],
    providers: [RunsService],
    exports: [RunsService],
})
export class RunsModule {}
