import { DealMovedEvent, DealClosedEvent } from '../events/pipeline.events';

export interface ValueHistoryEntry {
  value: number;
  changedAt: Date;
  changedBy: string;
}

export class Deal {
  private _events: DomainEvent[] = [];
  private _valueHistory: ValueHistoryEntry[] = [];

  constructor(
    public readonly id: string,
    public organizationId: string,
    public pipelineId: string,
    public stageId: string,
    public title: string,
    public value: number,
    public contactId: string | null,
    public ownerId: string | null,
    public source: string | null,
    public expectedClose: Date | null,
    public closedAt: Date | null,
    public lostReason: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  get events(): DomainEvent[] {
    return this._events;
  }

  get valueHistory(): ValueHistoryEntry[] {
    return this._valueHistory;
  }

  get isClosed(): boolean {
    return this.closedAt !== null;
  }

  clearEvents(): void {
    this._events = [];
  }

  moveToStage(stageId: string, userId: string, validStageIds: string[]): void {
    if (this.isClosed) {
      throw new Error('Cannot move a closed deal');
    }
    if (!validStageIds.includes(stageId)) {
      throw new Error(`Stage "${stageId}" is not a valid stage for this pipeline`);
    }
    const previousStageId = this.stageId;
    this.stageId = stageId;
    this.updatedAt = new Date();
    this._events.push(new DealMovedEvent(this.id, stageId, userId, previousStageId));
  }

  updateValue(newValue: number, userId: string): void {
    if (this.isClosed) {
      throw new Error('Cannot update value of a closed deal');
    }
    this._valueHistory.push({
      value: this.value,
      changedAt: new Date(),
      changedBy: userId,
    });
    this.value = newValue;
    this.updatedAt = new Date();
  }

  close(outcome: 'won' | 'lost', userId: string, reason?: string): void {
    if (this.isClosed) {
      throw new Error('Deal is already closed');
    }
    this.closedAt = new Date();
    this.updatedAt = new Date();
    if (outcome === 'lost') {
      this.lostReason = reason ?? null;
    } else {
      this.lostReason = null;
    }
    this._events.push(new DealClosedEvent(this.id, outcome, userId, reason));
  }

  reopen(): void {
    if (!this.isClosed) {
      throw new Error('Deal is not closed');
    }
    this.closedAt = null;
    this.lostReason = null;
    this.updatedAt = new Date();
  }
}

interface DomainEvent {
  readonly occurredOn: Date;
  readonly eventName: string;
}
