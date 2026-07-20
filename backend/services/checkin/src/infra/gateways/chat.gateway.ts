import {
    WebSocketGateway,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
} from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

export interface ChatMessagePayload {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: Date;
}

export interface TypingPayload {
    conversationId: string;
    userId: string;
    userName: string;
    isTyping: boolean;
}

@Injectable()
@WebSocketGateway({
    namespace: '/chat',
    cors: { origin: '*', credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    private server: Server;

    private typingTimers = new Map<string, NodeJS.Timeout>();

    constructor(private readonly jwtService: JwtService) {}

    async handleConnection(client: Socket): Promise<void> {
        try {
            const token = client.handshake.query.token as string;
            if (!token) {
                client.emit('error', { message: 'Authentication token required' });
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token);
            client.data.userId = payload.sub;
            client.data.userName = payload.name || 'Usuário';

            client.emit('authenticated', { userId: payload.sub });
        } catch {
            client.emit('error', { message: 'Invalid authentication token' });
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket): void {
        const userId = client.data.userId as string;
        if (userId) {
            for (const [key, timer] of this.typingTimers.entries()) {
                if (key.startsWith(`${userId}:`)) {
                    clearTimeout(timer);
                    this.typingTimers.delete(key);
                }
            }
        }
    }

    @SubscribeMessage('chat:join')
    handleJoinConversation(client: Socket, conversationId: string): void {
        if (!conversationId) {
            client.emit('error', { message: 'conversationId is required' });
            return;
        }
        client.join(`conversation:${conversationId}`);
        client.emit('chat:joined', { conversationId });
    }

    @SubscribeMessage('chat:leave')
    handleLeaveConversation(client: Socket, conversationId: string): void {
        if (!conversationId) return;
        client.leave(`conversation:${conversationId}`);
    }

    @SubscribeMessage('chat:message')
    handleMessage(client: Socket, payload: { conversationId: string; content: string }): void {
        if (!payload?.conversationId || !payload?.content?.trim()) {
            client.emit('error', { message: 'conversationId and content are required' });
            return;
        }

        const message: ChatMessagePayload = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            conversationId: payload.conversationId,
            senderId: client.data.userId,
            senderName: client.data.userName,
            content: payload.content.trim(),
            timestamp: new Date(),
        };

        this.server.to(`conversation:${payload.conversationId}`).emit('chat:message', message);
    }

    @SubscribeMessage('chat:typing')
    handleTyping(client: Socket, payload: { conversationId: string; isTyping: boolean }): void {
        if (!payload?.conversationId) return;

        const userId = client.data.userId as string;
        const room = `conversation:${payload.conversationId}`;

        const typingPayload: TypingPayload = {
            conversationId: payload.conversationId,
            userId,
            userName: client.data.userName,
            isTyping: payload.isTyping,
        };

        client.to(room).emit('chat:typing', typingPayload);

        if (payload.isTyping) {
            const timerKey = `${userId}:${payload.conversationId}`;
            if (this.typingTimers.has(timerKey)) {
                clearTimeout(this.typingTimers.get(timerKey)!);
            }
            this.typingTimers.set(
                timerKey,
                setTimeout(() => {
                    client.to(room).emit('chat:typing', { ...typingPayload, isTyping: false });
                    this.typingTimers.delete(timerKey);
                }, 3000),
            );
        }
    }

    emitMessage(conversationId: string, message: ChatMessagePayload): void {
        this.server.to(`conversation:${conversationId}`).emit('chat:message', message);
    }

    emitTyping(conversationId: string, userId: string, isTyping: boolean): void {
        this.server
            .to(`conversation:${conversationId}`)
            .emit('chat:typing', { conversationId, userId, isTyping } as TypingPayload);
    }
}
