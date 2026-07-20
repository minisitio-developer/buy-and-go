import { Module } from '@nestjs/common';
import { TriggersService } from './triggers.service';
import { WebhookController } from './webhook.controller';
import { ActionsModule } from '../actions/actions.module';

@Module({
    imports: [ActionsModule],
    controllers: [WebhookController],
    providers: [TriggersService],
    exports: [TriggersService],
})
export class TriggersModule {}
