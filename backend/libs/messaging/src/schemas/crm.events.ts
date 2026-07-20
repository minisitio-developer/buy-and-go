export interface DealCreatedEvent {
    dealId: string;
    organizationId: string;
    pipelineId: string;
    stageId: string;
    title: string;
    value: number;
    contactId?: string;
    ownerId?: string;
    source?: string;
    expectedClose?: Date;
    createdAt: Date;
}

export interface DealMovedEvent {
    dealId: string;
    organizationId: string;
    pipelineId: string;
    fromStageId: string;
    toStageId: string;
    movedBy: string;
    movedAt: Date;
}

export interface DealClosedEvent {
    dealId: string;
    organizationId: string;
    outcome: 'won' | 'lost';
    value: number;
    closedBy: string;
    lostReason?: string;
    closedAt: Date;
}

export interface ContactCreatedEvent {
    contactId: string;
    organizationId: string;
    name: string;
    email?: string;
    phone?: string;
    document?: string;
    company?: string;
    position?: string;
    source?: string;
    tags: string[];
    createdAt: Date;
}
