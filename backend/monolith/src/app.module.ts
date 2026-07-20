import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { RouterModule } from '@nestjs/core'

// Auth lib (provides JwtAuthGuard, CurrentUser, etc.)
import { AuthModule } from '@eventos-ai/auth'

// Import all service AppModules
import { AppModule as IdentityModule } from '@eventos/identity'
import { AppModule as EventModule } from '@eventos/event'
import { AppModule as TicketModule } from '@eventos/ticket'
import { AppModule as PaymentModule } from '@eventos/payment'
import { AppModule as CheckinModule } from '@eventos/checkin'
import { AppModule as CrmModule } from '@eventos/crm'
import { AppModule as SponsorModule } from '@eventos/sponsor'
import { AppModule as NotificationModule } from '@eventos/notification'
import { AppModule as SearchModule } from '@eventos/search'
import { AppModule as WorkflowModule } from '@eventos/workflow'
import { AppModule as DataIntegrationModule } from '@eventos/data-integration'
import { AppModule as DocumentModule } from '@eventos/document'
import { AppModule as NetworkingModule } from '@eventos/networking'
import { AppModule as MarketplaceModule } from '@eventos/marketplace'
import { AppModule as WhiteLabelModule } from '@eventos/white-label'
import { AppModule as SharedModule } from '@eventos/shared'
import { AppModule as AnalyticsModule } from '@eventos/analytics'

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 200 }]),
        AuthModule.forRoot(),

        // Route-prefix each service module
        RouterModule.register([
            { path: 'identity', module: IdentityModule },
            { path: 'events', module: EventModule },
            { path: 'tickets', module: TicketModule },
            { path: 'payments', module: PaymentModule },
            { path: 'checkin', module: CheckinModule },
            { path: 'crm', module: CrmModule },
            { path: 'sponsors', module: SponsorModule },
            { path: 'notifications', module: NotificationModule },
            { path: 'search', module: SearchModule },
            { path: 'workflows', module: WorkflowModule },
            { path: 'data-integration', module: DataIntegrationModule },
            { path: 'documents', module: DocumentModule },
            { path: 'networking', module: NetworkingModule },
            { path: 'marketplace', module: MarketplaceModule },
            { path: 'white-label', module: WhiteLabelModule },
            { path: 'shared', module: SharedModule },
            { path: 'analytics', module: AnalyticsModule },
        ]),

        IdentityModule,
        EventModule,
        TicketModule,
        PaymentModule,
        CheckinModule,
        CrmModule,
        SponsorModule,
        NotificationModule,
        SearchModule,
        WorkflowModule,
        DataIntegrationModule,
        DocumentModule,
        NetworkingModule,
        MarketplaceModule,
        WhiteLabelModule,
        SharedModule,
        AnalyticsModule,
    ],
})
export class AppModule {}
