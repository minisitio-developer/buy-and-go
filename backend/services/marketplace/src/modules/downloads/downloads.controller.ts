import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { DownloadsService } from './downloads.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class DownloadsController {
    constructor(private readonly service: DownloadsService) {}

    @Post('products/:productId/downloads')
    async create(
        @Param('productId') productId: string,
        @Body() body: any,
    ) {
        return this.service.create({ ...body, productId });
    }

    @Get('products/:productId/downloads')
    async findByProduct(@Param('productId') productId: string) {
        return this.service.findByProduct(productId);
    }

    @Get('downloads/:id')
    async findById(@Param('id') id: string) {
        return this.service.findById(id);
    }

    @Get('downloads/:id/signed-url')
    async generateSignedUrl(@Param('id') id: string) {
        return this.service.generateSignedUrl(id);
    }

    @Patch('downloads/:id')
    async update(@Param('id') id: string, @Body() body: any) {
        return this.service.update(id, body);
    }

    @Delete('downloads/:id')
    async remove(@Param('id') id: string) {
        return this.service.remove(id);
    }

    @Post('downloads/reorder')
    async reorder(@Body('items') items: Array<{ id: string; sortOrder: number }>) {
        return this.service.reorder(items);
    }
}
