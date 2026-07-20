import { Module } from '@nestjs/common';
import { ProximityService } from './proximity.service';
import { ProximityController } from './proximity.controller';

@Module({ controllers: [ProximityController], providers: [ProximityService], exports: [ProximityService] })
export class ProximityModule {}
