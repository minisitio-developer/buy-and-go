import { Module } from '@nestjs/common';
import { CrmConsumers } from './crm.consumers';

@Module({
    providers: [CrmConsumers],
})
export class ConsumersModule {}
