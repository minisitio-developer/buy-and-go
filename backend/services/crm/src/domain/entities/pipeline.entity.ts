import { DealMovedEvent } from '../events/pipeline.events';

export class Stage {
  constructor(
    public readonly id: string,
    public name: string,
    public position: number,
    public color: string | null,
    public probability: number,
    public readonly createdAt: Date,
  ) {}
}

export class Pipeline {
  private _events: DomainEvent[] = [];

  constructor(
    public readonly id: string,
    public organizationId: string,
    public name: string,
    public description: string | null,
    public stages: Stage[],
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  get events(): DomainEvent[] {
    return this._events;
  }

  clearEvents(): void {
    this._events = [];
  }

  addStage(stage: Stage): void {
    if (this.stages.length >= 10) {
      throw new Error('Maximum number of stages (10) reached');
    }
    if (this.stages.some((s) => s.name.toLowerCase() === stage.name.toLowerCase())) {
      throw new Error(`Stage with name "${stage.name}" already exists`);
    }
    this.stages.push(stage);
    this.updatedAt = new Date();
  }

  removeStage(stageId: string): void {
    const index = this.stages.findIndex((s) => s.id === stageId);
    if (index === -1) {
      throw new Error('Stage not found');
    }
    this.stages.splice(index, 1);
    this.updatedAt = new Date();
  }

  reorderStages(stageIds: string[]): void {
    const stageMap = new Map(this.stages.map((s) => [s.id, s]));
    const reordered: Stage[] = [];

    for (const id of stageIds) {
      const stage = stageMap.get(id);
      if (!stage) {
        throw new Error(`Stage "${id}" not found in pipeline`);
      }
      reordered.push(stage);
    }

    if (reordered.length !== this.stages.length) {
      throw new Error('Provided stage IDs do not match pipeline stages');
    }

    reordered.forEach((stage, index) => {
      stage.position = index;
    });

    this.stages = reordered;
    this.updatedAt = new Date();
  }
}

interface DomainEvent {
  readonly occurredOn: Date;
  readonly eventName: string;
}
