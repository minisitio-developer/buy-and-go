import { Module } from '@nestjs/common';
import { GenerationService } from './generation.service';
import { TemplatesModule } from '../templates/templates.module';

@Module({ providers: [GenerationService], exports: [GenerationService], imports: [TemplatesModule] })
export class GenerationModule {}
