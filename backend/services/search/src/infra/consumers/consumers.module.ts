import { Module } from '@nestjs/common';
import { SearchConsumer } from './search.consumer';

@Module({
    providers: [SearchConsumer],
})
export class ConsumersModule {}
