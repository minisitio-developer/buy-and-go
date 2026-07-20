import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '@eventos-ai/auth';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('me')
    async getProfile(@CurrentUser() user: { sub: string }) {
        return this.usersService.findMe(user.sub);
    }

    @Patch('me')
    async updateProfile(@Body() dto: UpdateUserDto, @CurrentUser() user: { sub: string }) {
        return this.usersService.updateMe(user.sub, dto);
    }
}
