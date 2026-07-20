import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../infra/database/prisma.service';

describe('AuthService', () => {
    let service: AuthService;
    let prisma: PrismaService;

    const mockPrisma = {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    };

    const mockJwtService = {
        sign: jest.fn().mockReturnValue('mock-token'),
        verify: jest.fn().mockReturnValue({ sub: 'user-id', email: 'test@test.com' }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        prisma = module.get<PrismaService>(PrismaService);
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockPrisma.user.create.mockResolvedValue({
                id: 'new-id',
                email: 'john@example.com',
                name: 'John Doe',
                createdAt: new Date(),
            });

            const result = await service.register({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'Str0ng!Pass1',
            });

            expect(result.user.email).toBe('john@example.com');
            expect(result.requiresEmailVerification).toBe(true);
        });

        it('should reject duplicate email', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });

            await expect(
                service.register({
                    name: 'John',
                    email: 'john@example.com',
                    password: 'Str0ng!Pass1',
                }),
            ).rejects.toThrow(ConflictException);
        });
    });

    describe('login', () => {
        it('should authenticate valid credentials', async () => {
            const bcrypt = require('bcrypt');
            const hash = await bcrypt.hash('Str0ng!Pass1', 12);

            mockPrisma.user.findUnique.mockResolvedValue({
                id: 'user-id',
                email: 'john@example.com',
                passwordHash: hash,
                name: 'John',
                isActive: true,
            });

            const result = await service.login('john@example.com', 'Str0ng!Pass1');
            expect(result.accessToken).toBe('mock-token');
            expect(result.user.email).toBe('john@example.com');
        });

        it('should reject invalid password', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({
                id: 'user-id',
                email: 'john@example.com',
                passwordHash: '$2b$12$invalid',
                isActive: true,
            });

            await expect(
                service.login('john@example.com', 'wrong-password'),
            ).rejects.toThrow(UnauthorizedException);
        });
    });
});
