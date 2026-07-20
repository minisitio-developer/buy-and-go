import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { ReviewsService } from './reviews.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class ReviewsController {
    constructor(private readonly service: ReviewsService) {}

    @Post('products/:productId/reviews')
    async create(
        @Param('productId') productId: string,
        @Body() body: any,
    ) {
        return this.service.create({ ...body, productId });
    }

    @Get('products/:productId/reviews')
    async findByProduct(
        @Param('productId') productId: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.service.findByProduct(productId, { page, perPage });
    }

    @Patch('reviews/:id')
    async update(
        @Param('id') id: string,
        @Body() body: any,
    ) {
        return this.service.update(id, body.participantId, body);
    }

    @Delete('reviews/:id')
    async remove(
        @Param('id') id: string,
        @Body('participantId') participantId: string,
    ) {
        return this.service.remove(id, participantId);
    }
}
