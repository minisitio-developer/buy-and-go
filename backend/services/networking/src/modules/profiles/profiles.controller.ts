import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@eventos-ai/auth';
import { ProfilesService } from './profiles.service';

@Controller('events/:eventId/profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
    constructor(private readonly service: ProfilesService) {}

    @Post()
    async create(
        @Param('eventId') eventId: string,
        @Body() body: {
            participantId: string;
            interests?: string[];
            expertise?: string[];
            goals?: string[];
            lookingFor?: string[];
            industry?: string;
            role?: string;
            company?: string;
            bio?: string;
            photoUrl?: string;
            linkedInUrl?: string;
        },
    ) {
        return this.service.create({ ...body, eventId });
    }

    @Get()
    async findByEvent(
        @Param('eventId') eventId: string,
        @Query('industry') industry?: string,
        @Query('role') role?: string,
        @Query('search') search?: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.service.findByEvent(eventId, { industry, role, search, page, perPage });
    }

    @Get(':participantId')
    async findById(@Param('participantId') participantId: string) {
        return this.service.findById(participantId);
    }

    @Patch(':participantId')
    async update(
        @Param('participantId') participantId: string,
        @Body() body: Partial<{
            interests: string[];
            expertise: string[];
            goals: string[];
            lookingFor: string[];
            industry: string;
            role: string;
            company: string;
            bio: string;
            photoUrl: string;
            linkedInUrl: string;
        }>,
    ) {
        return this.service.update(participantId, body);
    }

    @Delete(':participantId')
    async remove(@Param('participantId') participantId: string) {
        return this.service.remove(participantId);
    }
}
