import { Module } from '@nestjs/common';
import { CheckinConsumer } from './checkin.consumer';

@Module({
    providers: [CheckinConsumer],
})
export class ConsumersModule {}
