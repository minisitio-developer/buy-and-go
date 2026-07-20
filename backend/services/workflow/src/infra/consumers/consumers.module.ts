import { Module } from '@nestjs/common';
import { WorkflowConsumer } from './workflow.consumer';

@Module({
    providers: [WorkflowConsumer],
})
export class ConsumersModule {}
