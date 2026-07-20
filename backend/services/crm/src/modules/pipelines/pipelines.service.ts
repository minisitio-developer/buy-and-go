import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PipelineRepository } from '../../domain/repositories/pipeline.repository';
import { Pipeline, Stage } from '../../domain/entities/pipeline.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class PipelinesService {
  constructor(
    @Inject('PipelineRepository')
    private readonly pipelineRepo: PipelineRepository,
  ) {}

  async create(data: {
    organizationId: string;
    name: string;
    description?: string;
    stages?: { name: string; color?: string; probability?: number }[];
  }) {
    const now = new Date();
    const pipeline = new Pipeline(
      randomUUID(),
      data.organizationId,
      data.name,
      data.description ?? null,
      [],
      now,
      now,
    );

    if (data.stages) {
      for (let i = 0; i < data.stages.length; i++) {
        const s = data.stages[i];
        const stage = new Stage(
          randomUUID(),
          s.name,
          i,
          s.color ?? null,
          s.probability ?? 0,
          now,
        );
        pipeline.addStage(stage);
      }
    }

    await this.pipelineRepo.save(pipeline);
    return pipeline;
  }

  async findAll(organizationId: string, page = 1, limit = 20) {
    const [pipelines, total] = await this.pipelineRepo.findByOrganization(
      organizationId,
      page,
      limit,
    );
    return {
      data: pipelines,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const pipeline = await this.pipelineRepo.findById(id);
    if (!pipeline) throw new NotFoundException('Pipeline not found');
    return pipeline;
  }

  async addStage(
    pipelineId: string,
    data: { name: string; color?: string; probability?: number },
  ) {
    const pipeline = await this.findById(pipelineId);
    const maxPosition = pipeline.stages.reduce(
      (max, s) => Math.max(max, s.position),
      -1,
    );
    const stage = new Stage(
      randomUUID(),
      data.name,
      maxPosition + 1,
      data.color ?? null,
      data.probability ?? 0,
      new Date(),
    );
    pipeline.addStage(stage);
    await this.pipelineRepo.save(pipeline);
    return stage;
  }

  async updateStage(id: string, data: { name?: string; color?: string; probability?: number }) {
    const pipeline = await this.pipelineRepo.findById(id);
    if (!pipeline) throw new NotFoundException('Pipeline not found');
    Object.assign(pipeline, data);
    await this.pipelineRepo.save(pipeline);
    return pipeline;
  }

  async removeStage(pipelineId: string, stageId: string) {
    const pipeline = await this.findById(pipelineId);
    pipeline.removeStage(stageId);
    await this.pipelineRepo.save(pipeline);
  }
}
