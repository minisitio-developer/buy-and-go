import {
    Controller, Get, Post,
    Body, Param, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { PixService } from './pix.service';

@Controller('pix')
@UseGuards(JwtAuthGuard)
export class PixController {
    constructor(private readonly service: PixService) {}

    @Post('generate')
    async generate(@Body() body: { paymentId: string }) {
        return this.service.generate(body.paymentId);
    }

    @Get(':txid/status')
    async status(@Param('txid') txid: string) {
        return this.service.status(txid);
    }

    @Post('webhook')
    async webhook(@Body() body: any) {
        return this.service.handleWebhook(body);
    }
}
