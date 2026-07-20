import { Test, TestingModule } from '@nestjs/testing';
import { PipelinesService } from '../pipelines/pipelines.service';
import { PipelineRepository } from '../../domain/repositories/pipeline.repository';
import { Pipeline, Stage } from '../../domain/entities/pipeline.entity';
import { NotFoundException } from '@nestjs/common';

describe('PipelinesService', () => {
  let service: PipelinesService;
  let repo: jest.Mocked<PipelineRepository>;

  const now = new Date('2024-01-01');

  beforeEach(async () => {
    repo = {
      findById: jest.fn(),
      save: jest.fn(),
      findByOrganization: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelinesService,
        { provide: 'PipelineRepository', useValue: repo },
      ],
    }).compile();

    service = module.get<PipelinesService>(PipelinesService);
  });

  it('should create pipeline with stages', async () => {
    const result = await service.create({
      organizationId: 'org1',
      name: 'Sales Pipeline',
      stages: [{ name: 'Lead' }, { name: 'Qualified' }],
    });

    expect(result.id).toBeDefined();
    expect(result.name).toBe('Sales Pipeline');
    expect(result.stages).toHaveLength(2);
    expect(result.stages[0].name).toBe('Lead');
    expect(result.stages[0].position).toBe(0);
    expect(result.stages[1].name).toBe('Qualified');
    expect(result.stages[1].position).toBe(1);
    expect(repo.save).toHaveBeenCalledWith(result);
  });

  it('should list pipelines with pagination', async () => {
    const pipeline = new Pipeline('p1', 'org1', 'Sales', null, [], now, now);
    repo.findByOrganization.mockResolvedValue([[pipeline], 1]);

    const result = await service.findAll('org1', 1, 20);

    expect(result.data).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
    expect(result.pagination.page).toBe(1);
    expect(repo.findByOrganization).toHaveBeenCalledWith('org1', 1, 20);
  });

  it('should find pipeline by id', async () => {
    const pipeline = new Pipeline('p1', 'org1', 'Sales', null, [], now, now);
    repo.findById.mockResolvedValue(pipeline);

    const result = await service.findById('p1');
    expect(result.id).toBe('p1');
    expect(result.name).toBe('Sales');
  });

  it('should handle pipeline not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
  });

  it('should add stage to pipeline', async () => {
    const pipeline = new Pipeline('p1', 'org1', 'Sales', null, [
      new Stage('s1', 'Lead', 0, null, 0, now),
    ], now, now);
    repo.findById.mockResolvedValue(pipeline);

    const stage = await service.addStage('p1', { name: 'Qualified' });

    expect(stage.name).toBe('Qualified');
    expect(stage.position).toBe(1);
    expect(repo.save).toHaveBeenCalled();
  });

  it('should remove stage from pipeline', async () => {
    const pipeline = new Pipeline('p1', 'org1', 'Sales', null, [
      new Stage('s1', 'Lead', 0, null, 0, now),
    ], now, now);
    repo.findById.mockResolvedValue(pipeline);

    await service.removeStage('p1', 's1');
    expect(pipeline.stages).toHaveLength(0);
    expect(repo.save).toHaveBeenCalled();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
