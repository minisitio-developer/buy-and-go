import { io, Socket } from 'socket.io-client';

type EventCallback = (...args: any[]) => void;

interface NamespaceConnection {
    socket: Socket;
    listeners: Map<string, Set<EventCallback>>;
}

export class WebSocketManager {
    private static instance: WebSocketManager;
    private connections = new Map<string, NamespaceConnection>();
    private baseUrl: string;
    private token: string | null = null;
    private reconnectAttempts = new Map<string, number>();
    private maxReconnectAttempts = 10;

    private constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL || '';
    }

    static getInstance(): WebSocketManager {
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager();
        }
        return WebSocketManager.instance;
    }

    setToken(token: string | null): void {
        this.token = token;
    }

    connect(namespace: string, token?: string): Socket {
        const ns = namespace.startsWith('/') ? namespace : `/${namespace}`;
        const existing = this.connections.get(ns);
        if (existing?.socket.connected) {
            return existing.socket;
        }

        if (existing) {
            existing.socket.connect();
            return existing.socket;
        }

        const authToken = token || this.token;
        const socket = io(`${this.baseUrl}${ns}`, {
            auth: { token: authToken },
            query: authToken ? { token: authToken } : undefined,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 30000,
            randomizationFactor: 0.5,
        });

        const connection: NamespaceConnection = {
            socket,
            listeners: new Map(),
        };

        this.connections.set(ns, connection);
        this.reconnectAttempts.set(ns, 0);

        socket.on('connect', () => {
            this.reconnectAttempts.set(ns, 0);
        });

        socket.on('disconnect', (reason) => {
            if (reason === 'io server disconnect') {
                this.connections.delete(ns);
            }
        });

        socket.on('connect_error', () => {
            const attempts = this.reconnectAttempts.get(ns) || 0;
            this.reconnectAttempts.set(ns, attempts + 1);
            if (attempts >= this.maxReconnectAttempts) {
                socket.close();
                this.connections.delete(ns);
            }
        });

        return socket;
    }

    disconnect(namespace?: string): void {
        if (namespace) {
            const ns = namespace.startsWith('/') ? namespace : `/${namespace}`;
            const conn = this.connections.get(ns);
            if (conn) {
                conn.socket.removeAllListeners();
                conn.socket.close();
                this.connections.delete(ns);
                this.reconnectAttempts.delete(ns);
            }
        } else {
            for (const [ns, conn] of this.connections) {
                conn.socket.removeAllListeners();
                conn.socket.close();
            }
            this.connections.clear();
            this.reconnectAttempts.clear();
        }
    }

    joinRoom(namespace: string, room: string, data?: any): void {
        const socket = this.getSocket(namespace);
        if (socket) {
            socket.emit('join', room, data);
        }
    }

    leaveRoom(namespace: string, room: string): void {
        const socket = this.getSocket(namespace);
        if (socket) {
            socket.emit('leave', room);
        }
    }

    on(namespace: string, event: string, callback: EventCallback): () => void {
        const socket = this.getSocket(namespace);
        if (!socket) {
            console.warn(`WebSocket not connected to namespace: ${namespace}`);
            return () => {};
        }

        const conn = this.connections.get(namespace.startsWith('/') ? namespace : `/${namespace}`);
        if (!conn) return () => {};

        if (!conn.listeners.has(event)) {
            conn.listeners.set(event, new Set());
        }
        conn.listeners.get(event)!.add(callback);
        socket.on(event, callback);

        return () => {
            socket.off(event, callback);
            conn.listeners.get(event)?.delete(callback);
        };
    }

    emit(namespace: string, event: string, data?: any): void {
        const socket = this.getSocket(namespace);
        if (socket) {
            socket.emit(event, data);
        }
    }

    isConnected(namespace: string): boolean {
        const socket = this.getSocket(namespace);
        return socket?.connected ?? false;
    }

    private getSocket(namespace: string): Socket | undefined {
        const ns = namespace.startsWith('/') ? namespace : `/${namespace}`;
        return this.connections.get(ns)?.socket;
    }
}
