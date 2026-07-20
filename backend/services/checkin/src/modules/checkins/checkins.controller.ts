import {
    Controller, Get, Post, Body, Param, Query, UseGuards, UploadedFile, UseInterceptors, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { CheckInsService } from './checkins.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class CheckInsController {
    constructor(private readonly service: CheckInsService) {}

    @Post('check-in')
    async checkIn(@Body() body: any) {
        return this.service.checkIn(body);
    }

    @Post('check-in/manual')
    async manualCheckIn(@Body() body: any) {
        return this.service.manualCheckIn(body);
    }

    @Post('check-in/face')
    @UseInterceptors(FileInterceptor('image'))
    async checkInByFace(
        @Body('attendeeId') attendeeId: string,
        @Body('eventId') eventId: string,
        @UploadedFile() image: Express.Multer.File,
        @Body('threshold') threshold?: string,
        @Body('deviceInfo') deviceInfo?: string,
    ) {
        if (!image) throw new BadRequestException('Image file is required');
        if (!attendeeId) throw new BadRequestException('attendeeId is required');
        if (!eventId) throw new BadRequestException('eventId is required');

        return this.service.checkInByFace({
            attendeeId,
            eventId,
            image: image.buffer,
            threshold: threshold ? parseFloat(threshold) : undefined,
            deviceInfo: deviceInfo ? JSON.parse(deviceInfo) : undefined,
        });
    }

    @Get('events/:eventId/check-ins')
    async findByEvent(
        @Param('eventId') eventId: string,
        @Query('method') method?: string,
        @Query('date') date?: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.service.findByEvent(eventId, { method, date, page, perPage });
    }

    @Get('events/:eventId/check-ins/stats')
    async getStats(@Param('eventId') eventId: string) {
        return this.service.getStats(eventId);
    }
}
