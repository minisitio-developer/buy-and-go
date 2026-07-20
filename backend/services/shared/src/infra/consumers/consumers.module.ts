import { Module } from '@nestjs/common';
import { AuditConsumer } from './audit.consumer';

@Module({
    providers: [AuditConsumer],
})
export class ConsumersModule {}
