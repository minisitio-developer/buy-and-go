import { Module } from '@nestjs/common';
import { PrismaPipelineRepository } from './prisma-pipeline.repository';
import { PrismaDealRepository } from './prisma-deal.repository';
import { PrismaContactRepository } from './prisma-contact.repository';

const REPOSITORIES = [
  { provide: 'PipelineRepository', useClass: PrismaPipelineRepository },
  { provide: 'DealRepository', useClass: PrismaDealRepository },
  { provide: 'ContactRepository', useClass: PrismaContactRepository },
];

@Module({
  providers: [...REPOSITORIES],
  exports: [...REPOSITORIES],
})
export class RepositoriesModule {}
