import {
    Controller, Get, Post,
    Body, Param, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { BoletoService } from './boleto.service';

@Controller('boleto')
@UseGuards(JwtAuthGuard)
export class BoletoController {
    constructor(private readonly service: BoletoService) {}

    @Post('generate')
    async generate(@Body() body: { paymentId: string }) {
        return this.service.generate(body.paymentId);
    }

    @Get(':id/status')
    async status(@Param('id') id: string) {
        return this.service.status(id);
    }

    @Post('webhook')
    async webhook(@Body() body: any) {
        return this.service.handleWebhook(body);
    }
}
