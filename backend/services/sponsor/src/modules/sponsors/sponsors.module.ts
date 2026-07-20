import { Module } from '@nestjs/common';
import { SponsorsService } from './sponsors.service';
import { SponsorsController } from './sponsors.controller';

@Module({ controllers: [SponsorsController], providers: [SponsorsService], exports: [SponsorsService] })
export class SponsorsModule {}
