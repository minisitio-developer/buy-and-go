import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { PipelineRepository } from '../../domain/repositories/pipeline.repository';
import { Deal } from '../../domain/entities/deal.entity';
import { randomUUID } from 'crypto';
import { EventBusService, TOPICS } from '@eventos-ai/messaging';

@Injectable()
export class DealsService {
  constructor(
    @Inject('DealRepository')
    private readonly dealRepo: DealRepository,
    @Inject('PipelineRepository')
    private readonly pipelineRepo: PipelineRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async create(data: {
    organizationId: string;
    pipelineId: string;
    stageId: string;
    title: string;
    value?: number;
    contactId?: string;
    ownerId?: string;
    expectedClose?: string;
    source?: string;
  }) {
    const now = new Date();
    const deal = new Deal(
      randomUUID(),
      data.organizationId,
      data.pipelineId,
      data.stageId,
      data.title,
      data.value ?? 0,
      data.contactId ?? null,
      data.ownerId ?? null,
      data.source ?? null,
      data.expectedClose ? new Date(data.expectedClose) : null,
      null,
      null,
      now,
      now,
    );

    await this.dealRepo.save(deal);

    this.eventBus.publish(
      TOPICS.CRM.DEAL_CREATED,
      TOPICS.CRM.DEAL_CREATED,
      {
        dealId: deal.id,
        organizationId: data.organizationId,
        pipelineId: data.pipelineId,
        stageId: data.stageId,
        title: data.title,
        value: data.value ?? 0,
        contactId: data.contactId,
        ownerId: data.ownerId,
        source: data.source,
        expectedClose: data.expectedClose ? new Date(data.expectedClose) : null,
        createdAt: now,
      },
    ).catch(err => console.error('Failed to publish deal.created event', err));

    return deal;
  }

  async findAll(
    organizationId: string,
    params: { pipelineId?: string; stageId?: string; ownerId?: string; page?: number; limit?: number },
  ) {
    const { pipelineId, stageId, ownerId, page = 1, limit = 20 } = params;
    const [deals, total] = await this.dealRepo.findByOrganization(
      organizationId,
      { pipelineId, stageId, ownerId },
      page,
      limit,
    );
    return {
      data: deals,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const deal = await this.dealRepo.findById(id);
    if (!deal) throw new NotFoundException('Deal not found');
    return deal;
  }

  async moveToStage(id: string, stageId: string, userId: string) {
    const deal = await this.findById(id);
    const pipeline = await this.pipelineRepo.findById(deal.pipelineId);
    if (!pipeline) throw new NotFoundException('Pipeline not found');

    const validStageIds = pipeline.stages.map((s) => s.id);
    const fromStageId = deal.stageId;
    deal.moveToStage(stageId, userId, validStageIds);
    await this.dealRepo.save(deal);

    this.eventBus.publish(
      TOPICS.CRM.DEAL_MOVED,
      TOPICS.CRM.DEAL_MOVED,
      {
        dealId: deal.id,
        organizationId: deal.organizationId,
        pipelineId: deal.pipelineId,
        fromStageId,
        toStageId: stageId,
        movedBy: userId,
        movedAt: new Date(),
      },
    ).catch(err => console.error('Failed to publish deal.moved event', err));

    return deal;
  }

  async update(id: string, data: { title?: string; value?: number; expectedClose?: string }) {
    const deal = await this.findById(id);
    if (data.title !== undefined) deal.title = data.title;
    if (data.value !== undefined) deal.value = data.value;
    if (data.expectedClose !== undefined) {
      deal.expectedClose = new Date(data.expectedClose);
    }
    deal.updatedAt = new Date();
    await this.dealRepo.save(deal);
    return deal;
  }

  async close(id: string, won: boolean, userId: string, lostReason?: string) {
    const deal = await this.findById(id);
    const outcome = won ? 'won' : 'lost';
    deal.close(outcome, userId, lostReason);
    await this.dealRepo.save(deal);

    this.eventBus.publish(
      TOPICS.CRM.DEAL_CLOSED,
      TOPICS.CRM.DEAL_CLOSED,
      {
        dealId: deal.id,
        organizationId: deal.organizationId,
        outcome,
        value: deal.value,
        closedBy: userId,
        lostReason,
        closedAt: new Date(),
      },
    ).catch(err => console.error('Failed to publish deal.closed event', err));

    return deal;
  }

  async reopen(id: string) {
    const deal = await this.findById(id);
    deal.reopen();
    await this.dealRepo.save(deal);
    return deal;
  }

  async remove(id: string) {
    await this.findById(id);
    await this.dealRepo.delete(id);
  }
}
