import { Module } from '@nestjs/common';
import { EventAnalyticsService } from './event-analytics.service';
import { EventAnalyticsController } from './event-analytics.controller';

@Module({ controllers: [EventAnalyticsController], providers: [EventAnalyticsService], exports: [EventAnalyticsService] })
export class EventAnalyticsModule {}
