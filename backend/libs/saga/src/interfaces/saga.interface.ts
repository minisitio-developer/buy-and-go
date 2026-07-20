export enum SagaStatus {
    PENDING = 'pending',
    ACTIVE = 'active',
    COMPLETED = 'completed',
    COMPENSATING = 'compensating',
    COMPENSATED = 'compensated',
    FAILED = 'failed',
}

export enum SagaStepStatus {
    PENDING = 'pending',
    EXECUTING = 'executing',
    COMPLETED = 'completed',
    COMPENSATED = 'compensated',
    FAILED = 'failed',
}

export interface SagaStep {
    name: string;
    action: (data: any) => Promise<any>;
    compensate: (data: any) => Promise<void>;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
}

export interface SagaDefinition {
    name: string;
    steps: SagaStep[];
    compensations?: SagaStep[];
    timeout?: number;
}

export interface SagaStepInstance {
    name: string;
    status: SagaStepStatus;
    startedAt?: Date;
    completedAt?: Date;
    output?: any;
    error?: string;
    retryCount: number;
}

export interface SagaInstance {
    id: string;
    sagaName: string;
    status: SagaStatus;
    steps: SagaStepInstance[];
    currentStep: number;
    metadata: any;
    createdAt: Date;
    completedAt?: Date;
}

export interface SagaEvent {
    eventType: string;
    sagaId: string;
    stepName?: string;
    status?: string;
    data?: any;
    timestamp: Date;
}

export interface SagaOptions {
    global?: boolean;
    defaultStepTimeout?: number;
    defaultRetries?: number;
    defaultRetryDelay?: number;
}
