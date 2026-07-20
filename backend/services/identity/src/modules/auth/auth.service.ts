import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../infra/database/prisma.service';
import { UserEntity } from '../../core/domain/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async register(data: {
        name: string;
        email: string;
        password: string;
        document?: string;
        phone?: string;
    }) {
        const existing = await this.prisma.user.findUnique({
            where: { email: data.email.toLowerCase() },
        });

        if (existing) {
            throw new ConflictException('Email already registered');
        }

        const userEntity = UserEntity.create({
            id: crypto.randomUUID(),
            ...data,
        });

        const passwordHash = await bcrypt.hash(data.password, 12);

        const user = await this.prisma.user.create({
            data: {
                id: userEntity.id,
                email: userEntity.email,
                name: userEntity.name,
                passwordHash,
                document: userEntity.document,
                phone: userEntity.phone,
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
            },
        });

        return { user, requiresEmailVerification: true };
    }

    async login(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account deactivated');
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { sub: user.id, email: user.email };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        const membership = await this.prisma.organizationMember.findFirst({
            where: { userId: user.id },
            orderBy: { joinedAt: 'asc' },
            select: { organizationId: true },
        });

        return {
            accessToken,
            refreshToken,
            expiresIn: 3600,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                organizationId: membership?.organizationId || null,
            },
        };
    }

    async refreshToken(token: string) {
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });

            if (!user || !user.isActive) {
                throw new UnauthorizedException('Invalid token');
            }

            const newPayload = { sub: user.id, email: user.email };
            const accessToken = this.jwtService.sign(newPayload);
            const refreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

            return { accessToken, refreshToken, expiresIn: 3600 };
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
