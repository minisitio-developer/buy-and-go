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

export interface NotificationPayload {
    id: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    read: boolean;
    createdAt: Date;
}

@Injectable()
@WebSocketGateway({
    namespace: '/notifications',
    cors: { origin: '*', credentials: true },
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    private server: Server;

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
            const userId = payload.sub as string;
            client.data.userId = userId;

            client.join(`user:${userId}`);
            client.emit('authenticated', { userId });
        } catch {
            client.emit('error', { message: 'Invalid authentication token' });
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket): void {
        const userId = client.data.userId as string;
        if (userId) {
            client.leave(`user:${userId}`);
        }
    }

    @SubscribeMessage('notifications:markRead')
    handleMarkRead(client: Socket, notificationId: string): void {
        client.emit('notifications:read', { id: notificationId });
    }

    @SubscribeMessage('notifications:markAllRead')
    handleMarkAllRead(client: Socket): void {
        const userId = client.data.userId as string;
        if (userId) {
            client.emit('notifications:allRead', { userId });
        }
    }

    emitNotification(userId: string, notification: NotificationPayload): void {
        this.server.to(`user:${userId}`).emit('notification:new', notification);
    }

    emitUnreadCount(userId: string, count: number): void {
        this.server.to(`user:${userId}`).emit('notification:unreadCount', { count });
    }
}
