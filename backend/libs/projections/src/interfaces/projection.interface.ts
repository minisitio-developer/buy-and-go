import { DomainEvent } from '@eventos-ai/messaging'

export interface Projection {
    name: string
    version: number
    handler: (event: DomainEvent) => Promise<void>
    rebuild: () => Promise<void>
}

export interface ProjectionStatus {
    name: string
    lastProcessedEventId: string | null
    lastProcessedAt: Date | null
    state: Record<string, unknown>
}

export interface IProjectionEngine {
    register(projection: Projection): void
    start(): Promise<void>
    stop(): Promise<void>
    rebuild(projectionName: string): Promise<void>
    getStatus(projectionName?: string): Promise<ProjectionStatus | ProjectionStatus[]>
}
