import { Module } from '@nestjs/common';
import { MarketplaceConsumer } from './marketplace.consumer';

@Module({
    providers: [MarketplaceConsumer],
})
export class ConsumersModule {}
