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

interface CheckinUpdatePayload {
    eventId: string;
    attendee: { name: string; category: string; company?: string };
    method: string;
    checkedInAt: Date;
}

interface AttendanceStatsPayload {
    eventId: string;
    total: number;
    byMethod: { method: string; count: number }[];
    byHour: any[];
}

@Injectable()
@WebSocketGateway({
    namespace: '/checkin',
    cors: { origin: '*', credentials: true },
})
export class CheckinGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    private server: Server;

    private onlineUsers = new Map<string, Set<string>>();

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
            client.data.eventIds = [];

            client.emit('authenticated', { userId: payload.sub });
        } catch {
            client.emit('error', { message: 'Invalid authentication token' });
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket): void {
        const userId = client.data.userId as string;
        if (userId) {
            for (const [eventId, users] of this.onlineUsers.entries()) {
                if (users.has(userId)) {
                    users.delete(userId);
                    if (users.size === 0) {
                        this.onlineUsers.delete(eventId);
                    }
                    this.server.to(`event:${eventId}`).emit('checkin:onlineCount', users.size);
                }
            }
        }
    }

    @SubscribeMessage('checkin:live')
    handleLiveCheckin(client: Socket, eventId: string): void {
        if (!eventId) {
            client.emit('error', { message: 'eventId is required' });
            return;
        }

        const room = `event:${eventId}`;
        client.join(room);
        client.data.eventIds = [...(client.data.eventIds || []), eventId];

        const userId = client.data.userId as string;
        if (!this.onlineUsers.has(eventId)) {
            this.onlineUsers.set(eventId, new Set());
        }
        this.onlineUsers.get(eventId)!.add(userId);

        this.server.to(room).emit('checkin:onlineCount', this.onlineUsers.get(eventId)!.size);
        client.emit('checkin:joined', { eventId });
    }

    @SubscribeMessage('checkin:attendee')
    async handleAttendeeCheckin(client: Socket, payload: { eventId: string; qrCode?: string; document?: string }): Promise<void> {
        if (!payload?.eventId) {
            client.emit('error', { message: 'eventId is required' });
            return;
        }
        client.emit('checkin:attendeeResult', { status: 'processing', eventId: payload.eventId });
    }

    emitCheckinUpdate(eventId: string, checkinData: CheckinUpdatePayload): void {
        this.server.to(`event:${eventId}`).emit('checkin:update', checkinData);
    }

    emitAttendanceStats(eventId: string, stats: AttendanceStatsPayload): void {
        this.server.to(`event:${eventId}`).emit('checkin:stats', stats);
    }
}
