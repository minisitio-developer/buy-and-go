import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { GenerationModule } from '../generation/generation.module';

@Module({ controllers: [DocumentsController], providers: [DocumentsService], exports: [DocumentsService], imports: [GenerationModule] })
export class DocumentsModule {}
