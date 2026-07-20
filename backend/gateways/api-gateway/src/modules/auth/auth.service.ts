import { Injectable, UnauthorizedException, ConflictException, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
    private identityUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly jwtService: JwtService,
    ) {
        this.identityUrl = process.env.IDENTITY_SERVICE_URL || 'http://identity:3001';
    }

    async login(credentials: { email: string; password: string }) {
        try {
            const { data } = await firstValueFrom(
                this.httpService.post(`${this.identityUrl}/v1/auth/login`, credentials),
            );
            return data;
        } catch (error: any) {
            const status = error?.response?.status || 500;
            const message = error?.response?.data?.message || 'Authentication failed';
            throw new HttpException(message, status);
        }
    }

    async register(userData: { name: string; email: string; password: string }) {
        try {
            const { data } = await firstValueFrom(
                this.httpService.post(`${this.identityUrl}/v1/auth/register`, userData),
            );
            return data;
        } catch (error: any) {
            const status = error?.response?.status || 500;
            const message = error?.response?.data?.message || 'Registration failed';
            if (status === 409) {
                throw new ConflictException(message);
            }
            throw new HttpException(message, status);
        }
    }

    async refresh(refreshToken: string) {
        try {
            const { data } = await firstValueFrom(
                this.httpService.post(`${this.identityUrl}/v1/auth/refresh`, { refreshToken }),
            );
            return data;
        } catch (error: any) {
            const status = error?.response?.status || 500;
            const message = error?.response?.data?.message || 'Token refresh failed';
            throw new HttpException(message, status);
        }
    }

    async validateToken(token: string): Promise<any> {
        try {
            const payload = this.jwtService.verify(token);
            return payload;
        } catch {
            try {
                const { data } = await firstValueFrom(
                    this.httpService.post(`${this.identityUrl}/v1/auth/validate`, { token }),
                );
                return data;
            } catch {
                throw new UnauthorizedException('Invalid token');
            }
        }
    }
}
