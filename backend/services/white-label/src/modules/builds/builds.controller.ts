import {
    Controller, Get, Post, Param, Res, UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { BuildsService } from './builds.service';
import * as path from 'path';

@Controller('builds')
@UseGuards(JwtAuthGuard)
export class BuildsController {
    constructor(private readonly service: BuildsService) {}

    @Post('instances/:appInstanceId')
    async create(@Param('appInstanceId') appInstanceId: string) {
        return this.service.create({ appInstanceId });
    }

    @Get('instances/:appInstanceId')
    async findByInstance(@Param('appInstanceId') appInstanceId: string) {
        return this.service.findByInstance(appInstanceId);
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.service.findById(id);
    }

    @Get(':id/download')
    async download(@Param('id') id: string, @Res() res: Response) {
        const filePath = await this.service.getDownloadPath(id);
        const filename = path.basename(filePath);
        res.download(filePath, filename);
    }
}
