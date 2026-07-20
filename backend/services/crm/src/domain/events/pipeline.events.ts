import { DomainEvent } from './domain-event';

export class DealCreatedEvent implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventName = 'DealCreated';

  constructor(
    public readonly dealId: string,
    public readonly pipelineId: string,
    public readonly stageId: string,
    public readonly userId: string,
    occurredOn?: Date,
  ) {
    this.occurredOn = occurredOn ?? new Date();
  }
}

export class DealMovedEvent implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventName = 'DealMoved';

  constructor(
    public readonly dealId: string,
    public readonly stageId: string,
    public readonly userId: string,
    public readonly previousStageId: string,
    occurredOn?: Date,
  ) {
    this.occurredOn = occurredOn ?? new Date();
  }
}

export class DealClosedEvent implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventName = 'DealClosed';

  constructor(
    public readonly dealId: string,
    public readonly outcome: 'won' | 'lost',
    public readonly userId: string,
    public readonly reason?: string,
    occurredOn?: Date,
  ) {
    this.occurredOn = occurredOn ?? new Date();
  }
}
