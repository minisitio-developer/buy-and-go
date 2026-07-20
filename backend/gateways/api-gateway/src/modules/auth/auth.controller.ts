import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Authenticate user and return JWT' })
    @ApiBody({
        schema: { properties: { email: { type: 'string' }, password: { type: 'string' } } },
    })
    @ApiResponse({ status: 200, description: 'User authenticated successfully' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() credentials: { email: string; password: string }) {
        return this.authService.login(credentials);
    }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({
        schema: {
            properties: {
                name: { type: 'string' },
                email: { type: 'string' },
                password: { type: 'string' },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'User registered successfully' })
    @ApiResponse({ status: 409, description: 'Email already in use' })
    async register(@Body() userData: { name: string; email: string; password: string }) {
        return this.authService.register(userData);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh JWT token' })
    @ApiBody({
        schema: { properties: { refreshToken: { type: 'string' } } },
    })
    @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
    async refresh(@Body() body: { refreshToken: string }) {
        return this.authService.refresh(body.refreshToken);
    }
}
