import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class UpdateEventDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

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

    @IsOptional()
    @IsString()
    bannerUrl?: string;

    @IsOptional()
    settings?: any;
}
