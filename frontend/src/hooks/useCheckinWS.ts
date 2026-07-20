'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketManager } from '@/lib/websocket';

interface LiveCheckin {
    eventId: string;
    attendee: { name: string; category: string; company?: string };
    method: string;
    checkedInAt: string;
}

interface CheckinStats {
    total: number;
    byMethod: { method: string; count: number }[];
    byHour: any[];
}

interface UseCheckinWSReturn {
    liveCheckins: LiveCheckin[];
    stats: CheckinStats | null;
    onlineCount: number;
    connected: boolean;
    joinEvent: (eventId: string) => void;
    leaveEvent: (eventId: string) => void;
}

export function useCheckinWS(eventId?: string): UseCheckinWSReturn {
    const [liveCheckins, setLiveCheckins] = useState<LiveCheckin[]>([]);
    const [stats, setStats] = useState<CheckinStats | null>(null);
    const [onlineCount, setOnlineCount] = useState(0);
    const [connected, setConnected] = useState(false);
    const wsRef = useRef<WebSocketManager>(WebSocketManager.getInstance());
    const eventIdRef = useRef(eventId);

    useEffect(() => {
        eventIdRef.current = eventId;
    }, [eventId]);

    useEffect(() => {
        const ws = wsRef.current;
        const namespace = '/checkin';
        const token = localStorage.getItem('access_token');

        if (!token) return;

        const socket = ws.connect(namespace, token);

        const unsubConnect = ws.on(namespace, 'connect', () => {
            setConnected(true);
            if (eventIdRef.current) {
                ws.emit(namespace, 'checkin:live', eventIdRef.current);
            }
        });

        const unsubDisconnect = ws.on(namespace, 'disconnect', () => {
            setConnected(false);
        });

        const unsubUpdate = ws.on(namespace, 'checkin:update', (data: LiveCheckin) => {
            setLiveCheckins(prev => [data, ...prev].slice(0, 50));
        });

        const unsubStats = ws.on(namespace, 'checkin:stats', (data: CheckinStats) => {
            setStats(data);
        });

        const unsubOnline = ws.on(namespace, 'checkin:onlineCount', (count: number) => {
            setOnlineCount(count);
        });

        const unsubError = ws.on(namespace, 'error', (err: any) => {
            console.error('Checkin WS error:', err);
        });

        if (eventIdRef.current && socket.connected) {
            ws.emit(namespace, 'checkin:live', eventIdRef.current);
        }

        return () => {
            if (eventIdRef.current) {
                ws.emit(namespace, 'leave', `event:${eventIdRef.current}`);
            }
            unsubConnect();
            unsubDisconnect();
            unsubUpdate();
            unsubStats();
            unsubOnline();
            unsubError();
            ws.disconnect(namespace);
        };
    }, []);

    const joinEvent = useCallback((newEventId: string) => {
        eventIdRef.current = newEventId;
        const ws = wsRef.current;
        ws.emit('/checkin', 'checkin:live', newEventId);
    }, []);

    const leaveEvent = useCallback((leaveEventId: string) => {
        if (eventIdRef.current === leaveEventId) {
            eventIdRef.current = undefined;
        }
        const ws = wsRef.current;
        ws.emit('/checkin', 'leave', `event:${leaveEventId}`);
    }, []);

    return { liveCheckins, stats, onlineCount, connected, joinEvent, leaveEvent };
}
