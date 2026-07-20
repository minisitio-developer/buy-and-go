import { Module } from '@nestjs/common';
import { DocumentConsumer } from './document.consumer';

@Module({
    providers: [DocumentConsumer],
})
export class ConsumersModule {}
