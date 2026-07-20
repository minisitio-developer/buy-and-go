import { Global, Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { WebhooksController } from './webhooks.controller';

@Global()
@Module({
    controllers: [WebhooksController],
    providers: [StripeService],
    exports: [StripeService],
})
export class StripeModule {}
