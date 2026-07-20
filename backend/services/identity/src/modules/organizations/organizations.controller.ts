import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
@UseGuards(AuthGuard('jwt'))
export class OrganizationsController {
    constructor(private readonly organizationsService: OrganizationsService) {}

    @Post()
    async create(@Body() body: { name: string; slug: string; document?: string; plan?: string }) {
        return this.organizationsService.create(body);
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.organizationsService.findById(id);
    }

    @Get(':id/members')
    async listMembers(@Param('id') id: string) {
        return this.organizationsService.listMembers(id);
    }
}
