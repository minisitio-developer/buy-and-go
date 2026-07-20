import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { Deal } from '../../domain/entities/deal.entity';

@Injectable()
export class PrismaDealRepository implements DealRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Deal | null> {
    const record = await this.prisma.deal.findUnique({ where: { id } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async save(deal: Deal): Promise<void> {
    await this.prisma.deal.upsert({
      where: { id: deal.id },
      create: {
        id: deal.id,
        organizationId: deal.organizationId,
        pipelineId: deal.pipelineId,
        stageId: deal.stageId,
        title: deal.title,
        value: deal.value,
        contactId: deal.contactId,
        ownerId: deal.ownerId,
        source: deal.source,
        expectedClose: deal.expectedClose,
        closedAt: deal.closedAt,
        lostReason: deal.lostReason,
        createdAt: deal.createdAt,
      },
      update: {
        stageId: deal.stageId,
        title: deal.title,
        value: deal.value,
        contactId: deal.contactId,
        ownerId: deal.ownerId,
        expectedClose: deal.expectedClose,
        closedAt: deal.closedAt,
        lostReason: deal.lostReason,
      },
    });
  }

  async findByOrganization(
    orgId: string,
    filters: { pipelineId?: string; stageId?: string; ownerId?: string },
    page: number,
    limit: number,
  ): Promise<[Deal[], number]> {
    const where: any = { organizationId: orgId };
    if (filters.pipelineId) where.pipelineId = filters.pipelineId;
    if (filters.stageId) where.stageId = filters.stageId;
    if (filters.ownerId) where.ownerId = filters.ownerId;

    const [records, total] = await Promise.all([
      this.prisma.deal.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.deal.count({ where }),
    ]);
    return [records.map((r) => this.toDomain(r)), total];
  }

  async delete(id: string): Promise<void> {
    await this.prisma.deal.delete({ where: { id } });
  }

  private toDomain(record: any): Deal {
    return new Deal(
      record.id,
      record.organizationId,
      record.pipelineId,
      record.stageId,
      record.title,
      Number(record.value),
      record.contactId,
      record.ownerId,
      record.source,
      record.expectedClose,
      record.closedAt,
      record.lostReason,
      record.createdAt,
      record.updatedAt,
    );
  }
}
