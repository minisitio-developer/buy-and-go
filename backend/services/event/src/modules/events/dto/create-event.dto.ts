import {
    IsString, IsEnum, IsOptional, IsNumber, IsDateString, Min, MinLength,
} from 'class-validator';

export class CreateEventDto {
    @IsString()
    @MinLength(3)
    name!: string;

    @IsString()
    @IsEnum(['presential', 'hybrid', 'online'])
    type!: string;

    @IsDateString()
    startDate!: string;

    @IsDateString()
    endDate!: string;

    @IsString()
    timezone!: string;

    @IsString()
    organizationId!: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    capacity?: number;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    state?: string;
}
