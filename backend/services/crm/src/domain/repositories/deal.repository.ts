import { Deal } from '../entities/deal.entity';

export interface DealRepository {
  findById(id: string): Promise<Deal | null>;
  save(deal: Deal): Promise<void>;
  findByOrganization(
    orgId: string,
    filters: { pipelineId?: string; stageId?: string; ownerId?: string },
    page: number,
    limit: number,
  ): Promise<[Deal[], number]>;
  delete(id: string): Promise<void>;
}
