import { IsEmail, IsString, MinLength, Matches, IsOptional } from 'class-validator';

export class RegisterDto {
    @IsString()
    @MinLength(2)
    name!: string;

    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
        message: 'Password must contain uppercase, number, and special character',
    })
    password!: string;

    @IsOptional()
    @IsString()
    document?: string;

    @IsOptional()
    @IsString()
    phone?: string;
}
