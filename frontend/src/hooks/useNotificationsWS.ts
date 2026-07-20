'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketManager } from '@/lib/websocket';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    read: boolean;
    createdAt: string;
}

interface UseNotificationsWSReturn {
    notifications: Notification[];
    unreadCount: number;
    connected: boolean;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
}

export function useNotificationsWS(): UseNotificationsWSReturn {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [connected, setConnected] = useState(false);
    const wsRef = useRef<WebSocketManager>(WebSocketManager.getInstance());
    const toastRef = useRef<{ show?: (msg: string) => void }>({});

    useEffect(() => {
        const ws = wsRef.current;
        const namespace = '/notifications';
        const token = localStorage.getItem('access_token');

        if (!token) return;

        const socket = ws.connect(namespace, token);

        const unsubConnect = ws.on(namespace, 'connect', () => setConnected(true));
        const unsubDisconnect = ws.on(namespace, 'disconnect', () => setConnected(false));

        const unsubNotification = ws.on(namespace, 'notification:new', (notification: Notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);

            try {
                const toast = (window as any).toast;
                if (toast?.success) {
                    toast.success(notification.title || notification.message, { duration: 5000 });
                }
            } catch {}
        });

        const unsubUnread = ws.on(namespace, 'notification:unreadCount', ({ count }: { count: number }) => {
            setUnreadCount(count);
        });

        const unsubError = ws.on(namespace, 'error', (err: any) => {
            console.error('Notification WS error:', err);
        });

        return () => {
            unsubConnect();
            unsubDisconnect();
            unsubNotification();
            unsubUnread();
            unsubError();
            ws.disconnect(namespace);
        };
    }, []);

    const markAsRead = useCallback((id: string) => {
        wsRef.current.emit('/notifications', 'notifications:markRead', id);
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n)),
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    }, []);

    const markAllAsRead = useCallback(() => {
        wsRef.current.emit('/notifications', 'notifications:markAllRead');
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    }, []);

    return { notifications, unreadCount, connected, markAsRead, markAllAsRead };
}
