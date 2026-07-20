import { Deal } from '../entities/deal.entity';
import { DealMovedEvent, DealClosedEvent } from '../events/pipeline.events';

describe('Deal Entity', () => {
  const now = new Date('2024-01-01');
  const validStageIds = ['s1', 's2', 's3'];

  const createDeal = (overrides: Partial<Deal> = {}): Deal =>
    new Deal(
      overrides.id ?? 'd1',
      overrides.organizationId ?? 'org1',
      overrides.pipelineId ?? 'p1',
      overrides.stageId ?? 's1',
      overrides.title ?? 'Test Deal',
      overrides.value ?? 1000,
      overrides.contactId ?? null,
      overrides.ownerId ?? null,
      overrides.source ?? null,
      overrides.expectedClose ?? null,
      overrides.closedAt ?? null,
      overrides.lostReason ?? null,
      overrides.createdAt ?? now,
      overrides.updatedAt ?? now,
    );

  it('should create deal', () => {
    const deal = createDeal();
    expect(deal.id).toBe('d1');
    expect(deal.title).toBe('Test Deal');
    expect(deal.value).toBe(1000);
    expect(deal.stageId).toBe('s1');
    expect(deal.isClosed).toBe(false);
  });

  it('should move to valid stage', () => {
    const deal = createDeal();
    deal.moveToStage('s2', 'user1', validStageIds);
    expect(deal.stageId).toBe('s2');
    expect(deal.events).toHaveLength(1);
    expect(deal.events[0]).toBeInstanceOf(DealMovedEvent);
    expect((deal.events[0] as DealMovedEvent).previousStageId).toBe('s1');
    expect((deal.events[0] as DealMovedEvent).userId).toBe('user1');
  });

  it('should reject invalid stage transitions', () => {
    const deal = createDeal();
    expect(() => deal.moveToStage('invalid', 'user1', validStageIds)).toThrow(
      'Stage "invalid" is not a valid stage for this pipeline',
    );
  });

  it('should reject move on closed deal', () => {
    const deal = createDeal();
    deal.close('won', 'user1');
    expect(() => deal.moveToStage('s2', 'user1', validStageIds)).toThrow(
      'Cannot move a closed deal',
    );
  });

  it('should close as won', () => {
    const deal = createDeal();
    deal.close('won', 'user1');
    expect(deal.isClosed).toBe(true);
    expect(deal.closedAt).toBeInstanceOf(Date);
    expect(deal.lostReason).toBeNull();
    expect(deal.events).toHaveLength(1);
    expect(deal.events[0]).toBeInstanceOf(DealClosedEvent);
    expect((deal.events[0] as DealClosedEvent).outcome).toBe('won');
  });

  it('should close as lost with reason', () => {
    const deal = createDeal();
    deal.close('lost', 'user1', 'Budget too high');
    expect(deal.isClosed).toBe(true);
    expect(deal.lostReason).toBe('Budget too high');
    expect(deal.events).toHaveLength(1);
    expect((deal.events[0] as DealClosedEvent).outcome).toBe('lost');
    expect((deal.events[0] as DealClosedEvent).reason).toBe('Budget too high');
  });

  it('should reject close on already closed deal', () => {
    const deal = createDeal();
    deal.close('won', 'user1');
    expect(() => deal.close('lost', 'user1')).toThrow('Deal is already closed');
  });

  it('should reopen closed deal', () => {
    const deal = createDeal();
    deal.close('lost', 'user1', 'Not interested');
    deal.reopen();
    expect(deal.isClosed).toBe(false);
    expect(deal.closedAt).toBeNull();
    expect(deal.lostReason).toBeNull();
  });

  it('should reject reopen on non-closed deal', () => {
    const deal = createDeal();
    expect(() => deal.reopen()).toThrow('Deal is not closed');
  });

  it('should track value history', () => {
    const deal = createDeal();
    deal.updateValue(2000, 'user1');
    expect(deal.value).toBe(2000);
    expect(deal.valueHistory).toHaveLength(1);
    expect(deal.valueHistory[0].value).toBe(1000);
    expect(deal.valueHistory[0].changedBy).toBe('user1');
  });

  it('should reject update value on closed deal', () => {
    const deal = createDeal();
    deal.close('won', 'user1');
    expect(() => deal.updateValue(2000, 'user1')).toThrow(
      'Cannot update value of a closed deal',
    );
  });
});
