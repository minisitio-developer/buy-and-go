import { Injectable, Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class InboxService {
    private readonly logger = new Logger(InboxService.name)
    private readonly prisma: PrismaClient

    constructor(config?: { prismaClient?: PrismaClient }) {
        this.prisma = config?.prismaClient || new PrismaClient()
    }

    async isDuplicate(messageId: string): Promise<boolean> {
        const existing = await this.prisma.inboxMessage.findUnique({
            where: { id: messageId },
        })
        return existing !== null
    }

    async markReceived(
        messageId: string,
        eventType: string,
        source: string,
        payload: Record<string, unknown>,
        correlationId?: string,
        causationId?: string,
    ): Promise<boolean> {
        if (await this.isDuplicate(messageId)) {
            this.logger.debug(`Duplicate message ${messageId} (${eventType})`)
            return false
        }

        await this.prisma.inboxMessage.create({
            data: {
                id: messageId,
                eventType,
                source,
                correlationId,
                causationId,
                payload: payload as any,
                status: 'received',
            },
        })

        return true
    }

    async markProcessed(messageId: string): Promise<void> {
        await this.prisma.inboxMessage.update({
            where: { id: messageId },
            data: {
                status: 'processed',
                processedAt: new Date(),
            },
        })
    }

    async markFailed(messageId: string, error: string): Promise<void> {
        await this.prisma.inboxMessage.update({
            where: { id: messageId },
            data: {
                status: 'failed',
                processingError: error,
            },
        })
    }

    async processMessage<T>(
        messageId: string,
        eventType: string,
        source: string,
        payload: Record<string, unknown>,
        handler: (data: T) => Promise<void>,
        correlationId?: string,
        causationId?: string,
    ): Promise<boolean> {
        const accepted = await this.markReceived(messageId, eventType, source, payload, correlationId, causationId)
        if (!accepted) return false

        try {
            await handler(payload as unknown as T)
            await this.markProcessed(messageId)
            return true
        } catch (error: any) {
            this.logger.error(`Failed to process message ${messageId}`, error)
            await this.markFailed(messageId, error.message)
            throw error
        }
    }
}
