import {
    Controller, Get, Post, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { SignaturesService } from './signatures.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class SignaturesController {
    constructor(private readonly service: SignaturesService) {}

    @Post('signatures')
    async create(@Body() body: any) {
        return this.service.create(body);
    }

    @Get('documents/:documentId/signatures')
    async findByDocument(@Param('documentId') documentId: string) {
        return this.service.findByDocument(documentId);
    }

    @Post('signatures/:id/sign')
    async sign(@Param('id') id: string, @Body() body: any) {
        return this.service.sign(id, body);
    }

    @Post('signatures/:id/decline')
    async decline(@Param('id') id: string) {
        return this.service.decline(id);
    }
}
