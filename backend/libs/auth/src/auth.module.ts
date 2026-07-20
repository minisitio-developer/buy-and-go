import { DynamicModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './guards/jwt.strategy';

export interface AuthModuleOptions {
    jwtSecret?: string;
    global?: boolean;
}

@Module({})
export class AuthModule {
    static forRoot(options: AuthModuleOptions = {}): DynamicModule {
        return {
            module: AuthModule,
            global: options.global ?? true,
            imports: [
                PassportModule.register({ defaultStrategy: 'jwt' }),
                JwtModule.register({
                    secret: options.jwtSecret || process.env.JWT_SECRET || 'dev-secret',
                    signOptions: { expiresIn: '1h' },
                }),
            ],
            providers: [JwtStrategy],
            exports: [PassportModule, JwtModule],
        };
    }
}
