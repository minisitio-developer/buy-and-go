import { Pipeline } from '../entities/pipeline.entity';

export interface PipelineRepository {
  findById(id: string): Promise<Pipeline | null>;
  save(pipeline: Pipeline): Promise<void>;
  findByOrganization(
    orgId: string,
    page: number,
    limit: number,
  ): Promise<[Pipeline[], number]>;
  delete(id: string): Promise<void>;
}
