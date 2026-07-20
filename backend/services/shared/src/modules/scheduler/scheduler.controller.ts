import {
    Controller, Get, Post, Put, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { SchedulerService } from './scheduler.service';

@Controller('scheduler')
@UseGuards(JwtAuthGuard)
export class SchedulerController {
    constructor(private readonly service: SchedulerService) {}

    @Get()
    async findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.service.findById(id);
    }

    @Post()
    async create(@Body() body: any) {
        return this.service.create(body);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        return this.service.update(id, body);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.service.delete(id);
        return { deleted: true };
    }

    @Post(':id/execute')
    async executeNow(@Param('id') id: string) {
        return this.service.executeNow(id);
    }
}
