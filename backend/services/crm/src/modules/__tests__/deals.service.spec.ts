import { Test, TestingModule } from '@nestjs/testing';
import { DealsService } from '../deals/deals.service';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { PipelineRepository } from '../../domain/repositories/pipeline.repository';
import { Deal } from '../../domain/entities/deal.entity';
import { Pipeline, Stage } from '../../domain/entities/pipeline.entity';
import { NotFoundException } from '@nestjs/common';

describe('DealsService', () => {
  let service: DealsService;
  let dealRepo: jest.Mocked<DealRepository>;
  let pipelineRepo: jest.Mocked<PipelineRepository>;

  const now = new Date('2024-01-01');

  const mockPipeline = new Pipeline('p1', 'org1', 'Sales', null, [
    new Stage('s1', 'Lead', 0, null, 0, now),
    new Stage('s2', 'Qualified', 1, null, 0, now),
    new Stage('s3', 'Closed Won', 2, null, 0, now),
  ], now, now);

  beforeEach(async () => {
    dealRepo = {
      findById: jest.fn(),
      save: jest.fn(),
      findByOrganization: jest.fn(),
      delete: jest.fn(),
    };

    pipelineRepo = {
      findById: jest.fn(),
      save: jest.fn(),
      findByOrganization: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DealsService,
        { provide: 'DealRepository', useValue: dealRepo },
        { provide: 'PipelineRepository', useValue: pipelineRepo },
      ],
    }).compile();

    service = module.get<DealsService>(DealsService);
  });

  it('should create deal', async () => {
    const result = await service.create({
      organizationId: 'org1',
      pipelineId: 'p1',
      stageId: 's1',
      title: 'Test Deal',
      value: 5000,
    });

    expect(result.id).toBeDefined();
    expect(result.title).toBe('Test Deal');
    expect(result.value).toBe(5000);
    expect(result.stageId).toBe('s1');
    expect(dealRepo.save).toHaveBeenCalledWith(result);
  });

  it('should list deals with pagination', async () => {
    const deal = new Deal('d1', 'org1', 'p1', 's1', 'Test', 1000, null, null, null, null, null, null, now, now);
    dealRepo.findByOrganization.mockResolvedValue([[deal], 1]);

    const result = await service.findAll('org1', { page: 1, limit: 20 });

    expect(result.data).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
  });

  it('should filter deals by pipeline', async () => {
    dealRepo.findByOrganization.mockResolvedValue([[], 0]);
    await service.findAll('org1', { pipelineId: 'p1', page: 1, limit: 20 });

    expect(dealRepo.findByOrganization).toHaveBeenCalledWith(
      'org1',
      { pipelineId: 'p1', stageId: undefined, ownerId: undefined },
      1,
      20,
    );
  });

  it('should move deal to valid stage', async () => {
    const deal = new Deal('d1', 'org1', 'p1', 's1', 'Test', 1000, null, null, null, null, null, null, now, now);
    dealRepo.findById.mockResolvedValue(deal);
    pipelineRepo.findById.mockResolvedValue(mockPipeline);

    const result = await service.moveToStage('d1', 's2', 'user1');

    expect(result.stageId).toBe('s2');
    expect(dealRepo.save).toHaveBeenCalled();
  });

  it('should throw on move to invalid stage', async () => {
    const deal = new Deal('d1', 'org1', 'p1', 's1', 'Test', 1000, null, null, null, null, null, null, now, now);
    dealRepo.findById.mockResolvedValue(deal);
    pipelineRepo.findById.mockResolvedValue(mockPipeline);

    await expect(service.moveToStage('d1', 'invalid', 'user1')).rejects.toThrow(
      'Stage "invalid" is not a valid stage for this pipeline',
    );
  });

  it('should find deal by id', async () => {
    const deal = new Deal('d1', 'org1', 'p1', 's1', 'Test', 1000, null, null, null, null, null, null, now, now);
    dealRepo.findById.mockResolvedValue(deal);

    const result = await service.findById('d1');
    expect(result.id).toBe('d1');
  });

  it('should handle deal not found', async () => {
    dealRepo.findById.mockResolvedValue(null);
    await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
  });

  it('should close deal as won', async () => {
    const deal = new Deal('d1', 'org1', 'p1', 's1', 'Test', 1000, null, null, null, null, null, null, now, now);
    dealRepo.findById.mockResolvedValue(deal);

    const result = await service.close('d1', true, 'user1');
    expect(result.isClosed).toBe(true);
    expect(result.lostReason).toBeNull();
  });

  it('should close deal as lost with reason', async () => {
    const deal = new Deal('d1', 'org1', 'p1', 's1', 'Test', 1000, null, null, null, null, null, null, now, now);
    dealRepo.findById.mockResolvedValue(deal);

    const result = await service.close('d1', false, 'user1', 'Budget too high');
    expect(result.isClosed).toBe(true);
    expect(result.lostReason).toBe('Budget too high');
  });

  it('should reopen closed deal', async () => {
    const deal = new Deal('d1', 'org1', 'p1', 's1', 'Test', 1000, null, null, null, null, new Date(), 'Lost', now, now);
    dealRepo.findById.mockResolvedValue(deal);

    const result = await service.reopen('d1');
    expect(result.isClosed).toBe(false);
    expect(result.closedAt).toBeNull();
  });

  it('should remove deal', async () => {
    const deal = new Deal('d1', 'org1', 'p1', 's1', 'Test', 1000, null, null, null, null, null, null, now, now);
    dealRepo.findById.mockResolvedValue(deal);
    dealRepo.delete.mockResolvedValue();

    await service.remove('d1');
    expect(dealRepo.delete).toHaveBeenCalledWith('d1');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
