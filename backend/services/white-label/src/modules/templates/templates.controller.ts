import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { TemplatesService } from './templates.service';

@Controller('templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
    constructor(private readonly service: TemplatesService) {}

    @Post()
    async create(@Body() body: any) {
        return this.service.create(body);
    }

    @Get()
    async findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.service.findById(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        return this.service.update(id, body);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}
