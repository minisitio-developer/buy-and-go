import { Module } from '@nestjs/common'
import { ThrottlerModule } from '@nestjs/throttler'
import { AuthModule } from '@eventos-ai/auth'
import { EventBusModule } from '@eventos-ai/messaging'
import { EventStoreModule } from '@eventos-ai/event-store'
import { DatabaseModule } from './infra/database/database.module'
import { EventsModule } from './modules/events/events.module'
import { RoomsModule } from './modules/rooms/rooms.module'
import { SchedulesModule } from './modules/schedules/schedules.module'
import { HealthModule } from './modules/health/health.module'

@Module({
    imports: [
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 200 }]),
        AuthModule.forRoot(),
        EventBusModule.forRoot(),
        EventStoreModule.forRoot(),
        DatabaseModule,
        EventsModule,
        RoomsModule,
        SchedulesModule,
        HealthModule,
    ],
})
export class AppModule {}
