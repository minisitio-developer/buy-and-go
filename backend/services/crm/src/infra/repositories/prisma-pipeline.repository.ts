import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PipelineRepository } from '../../domain/repositories/pipeline.repository';
import { Pipeline, Stage } from '../../domain/entities/pipeline.entity';

@Injectable()
export class PrismaPipelineRepository implements PipelineRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Pipeline | null> {
    const record = await this.prisma.pipeline.findUnique({
      where: { id },
      include: { stages: { orderBy: { position: 'asc' } } },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async save(pipeline: Pipeline): Promise<void> {
    const data = {
      name: pipeline.name,
      description: pipeline.description,
      updatedAt: pipeline.updatedAt,
    };
    await this.prisma.pipeline.upsert({
      where: { id: pipeline.id },
      create: {
        id: pipeline.id,
        organizationId: pipeline.organizationId,
        name: pipeline.name,
        description: pipeline.description,
        createdAt: pipeline.createdAt,
      },
      update: data,
    });

    for (const stage of pipeline.stages) {
      await this.prisma.stage.upsert({
        where: { id: stage.id },
        create: {
          id: stage.id,
          pipelineId: pipeline.id,
          name: stage.name,
          position: stage.position,
          color: stage.color,
          probability: stage.probability,
          createdAt: stage.createdAt,
        },
        update: {
          name: stage.name,
          position: stage.position,
          color: stage.color,
          probability: stage.probability,
        },
      });
    }
  }

  async findByOrganization(
    orgId: string,
    page: number,
    limit: number,
  ): Promise<[Pipeline[], number]> {
    const [records, total] = await Promise.all([
      this.prisma.pipeline.findMany({
        where: { organizationId: orgId },
        include: { stages: { orderBy: { position: 'asc' } } },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.pipeline.count({ where: { organizationId: orgId } }),
    ]);
    return [records.map((r) => this.toDomain(r)), total];
  }

  async delete(id: string): Promise<void> {
    await this.prisma.pipeline.delete({ where: { id } });
  }

  private toDomain(record: any): Pipeline {
    const stages = record.stages.map(
      (s: any) =>
        new Stage(s.id, s.name, s.position, s.color, s.probability, s.createdAt),
    );
    return new Pipeline(
      record.id,
      record.organizationId,
      record.name,
      record.description,
      stages,
      record.createdAt,
      record.updatedAt ?? new Date(),
    );
  }
}
