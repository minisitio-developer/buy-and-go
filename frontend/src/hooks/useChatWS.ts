'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketManager } from '@/lib/websocket';

interface ChatMessage {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: string;
}

interface TypingUser {
    userId: string;
    userName: string;
}

interface UseChatWSReturn {
    messages: ChatMessage[];
    connected: boolean;
    typingUsers: TypingUser[];
    joinConversation: (conversationId: string) => void;
    leaveConversation: (conversationId: string) => void;
    sendMessage: (conversationId: string, content: string) => void;
    sendTyping: (conversationId: string, isTyping: boolean) => void;
    clearMessages: () => void;
}

export function useChatWS(conversationId?: string): UseChatWSReturn {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [connected, setConnected] = useState(false);
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const wsRef = useRef<WebSocketManager>(WebSocketManager.getInstance());
    const currentConvId = useRef<string | undefined>(conversationId);
    const currentUserId = useRef<string | null>(null);

    useEffect(() => {
        currentConvId.current = conversationId;
    }, [conversationId]);

    useEffect(() => {
        const ws = wsRef.current;
        const namespace = '/chat';
        const token = localStorage.getItem('access_token');

        if (!token) return;

        const socket = ws.connect(namespace, token);

        const unsubConnect = ws.on(namespace, 'connect', () => {
            currentUserId.current = socket.auth?.userId || null;
            setConnected(true);
            if (currentConvId.current) {
                ws.emit(namespace, 'chat:join', currentConvId.current);
            }
        });

        const unsubDisconnect = ws.on(namespace, 'disconnect', () => setConnected(false));

        const unsubAuthenticated = ws.on(namespace, 'authenticated', ({ userId }: { userId: string }) => {
            currentUserId.current = userId;
        });

        const unsubMessage = ws.on(namespace, 'chat:message', (message: ChatMessage) => {
            setMessages(prev => {
                if (prev.some(m => m.id === message.id)) return prev;
                return [...prev, message];
            });
        });

        const unsubTyping = ws.on(namespace, 'chat:typing', (data: { userId: string; userName: string; isTyping: boolean }) => {
            if (data.userId === currentUserId.current) return;
            setTypingUsers(prev => {
                if (data.isTyping) {
                    if (prev.some(u => u.userId === data.userId)) return prev;
                    return [...prev, { userId: data.userId, userName: data.userName }];
                }
                return prev.filter(u => u.userId !== data.userId);
            });
        });

        const unsubError = ws.on(namespace, 'error', (err: any) => {
            console.error('Chat WS error:', err);
        });

        if (currentConvId.current && socket.connected) {
            ws.emit(namespace, 'chat:join', currentConvId.current);
        }

        return () => {
            if (currentConvId.current) {
                ws.emit(namespace, 'chat:leave', currentConvId.current);
            }
            unsubConnect();
            unsubDisconnect();
            unsubAuthenticated();
            unsubMessage();
            unsubTyping();
            unsubError();
            ws.disconnect(namespace);
        };
    }, []);

    const joinConversation = useCallback((convId: string) => {
        currentConvId.current = convId;
        wsRef.current.emit('/chat', 'chat:join', convId);
    }, []);

    const leaveConversation = useCallback((convId: string) => {
        if (currentConvId.current === convId) {
            currentConvId.current = undefined;
        }
        wsRef.current.emit('/chat', 'chat:leave', convId);
    }, []);

    const sendMessage = useCallback((convId: string, content: string) => {
        if (!content.trim()) return;
        wsRef.current.emit('/chat', 'chat:message', { conversationId: convId, content: content.trim() });
    }, []);

    const sendTyping = useCallback((convId: string, isTyping: boolean) => {
        wsRef.current.emit('/chat', 'chat:typing', { conversationId: convId, isTyping });
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
        setTypingUsers([]);
    }, []);

    return {
        messages,
        connected,
        typingUsers,
        joinConversation,
        leaveConversation,
        sendMessage,
        sendTyping,
        clearMessages,
    };
}
