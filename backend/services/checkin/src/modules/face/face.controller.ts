import {
    Controller, Get, Post, Delete,
    Param, Body, UploadedFile, UseInterceptors, UseGuards, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { FaceService } from './face.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class FaceController {
    constructor(private readonly service: FaceService) {}

    @Post('v1/face/enroll')
    @UseInterceptors(FileInterceptor('image'))
    async enrollFace(
        @Body('attendeeId') attendeeId: string,
        @UploadedFile() image: Express.Multer.File,
    ) {
        if (!image) throw new BadRequestException('Image file is required');
        if (!attendeeId) throw new BadRequestException('attendeeId is required');
        return this.service.enrollFace(attendeeId, image.buffer);
    }

    @Get('v1/face/templates/:attendeeId')
    async getTemplates(@Param('attendeeId') attendeeId: string) {
        return this.service.getTemplates(attendeeId);
    }

    @Delete('v1/face/templates/:attendeeId/:templateId')
    async deleteTemplate(
        @Param('attendeeId') attendeeId: string,
        @Param('templateId') templateId: string,
    ) {
        return this.service.deleteTemplate(attendeeId, templateId);
    }
}
