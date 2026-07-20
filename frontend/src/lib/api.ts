const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function refreshToken(): Promise<string | null> {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return null;

    try {
        const res = await fetch(`${API_BASE}/v1/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: refresh }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        localStorage.setItem('access_token', data.accessToken);
        localStorage.setItem('refresh_token', data.refreshToken);
        return data.accessToken;
    } catch {
        return null;
    }
}

export async function api<T = any>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;

    let res = await fetch(`${API_BASE}/v1${path}`, { ...options, headers });

    if (res.status === 401 && token) {
        const newToken = await refreshToken();
        if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
            res = await fetch(`${API_BASE}/v1${path}`, { ...options, headers });
        } else {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            if (typeof window !== 'undefined') window.location.href = '/login';
            throw new Error('Session expired');
        }
    }

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || error.error?.message || `HTTP ${res.status}`);
    }

    return res.json();
}

export const eventosApi = {
    auth: {
        register: (data: any) => api('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
        login: (data: any) => api('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
        refresh: (data: any) => api('/auth/refresh', { method: 'POST', body: JSON.stringify(data) }),
    },
    events: {
        list: (params?: string) => api(`/events?${params || ''}`),
        get: (id: string) => api(`/events/${id}`),
        create: (data: any) => api('/events', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: any) => api(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
        publish: (id: string) => api(`/events/${id}/publish`, { method: 'POST' }),
        cancel: (id: string) => api(`/events/${id}/cancel`, { method: 'POST' }),
        duplicate: (id: string) => api(`/events/${id}/duplicate`, { method: 'POST' }),
        remove: (id: string) => api(`/events/${id}`, { method: 'DELETE' }),
    },
    attendees: {
        list: (eventId: string, params?: string) => api(`/events/${eventId}/attendees?${params || ''}`),
        create: (eventId: string, data: any) => api(`/events/${eventId}/attendees`, { method: 'POST', body: JSON.stringify(data) }),
        batch: (eventId: string, data: any) => api(`/events/${eventId}/attendees/batch`, { method: 'POST', body: JSON.stringify(data) }),
        remove: (id: string) => api(`/attendees/${id}`, { method: 'DELETE' }),
    },
    checkin: {
        checkIn: (data: any) => api('/check-in', { method: 'POST', body: JSON.stringify(data) }),
        stats: (eventId: string) => api(`/events/${eventId}/check-ins/stats`),
    },
    crm: {
        pipelines: {
            list: () => api('/crm/pipelines'),
            create: (data: any) => api('/crm/pipelines', { method: 'POST', body: JSON.stringify(data) }),
        },
        deals: {
            list: (params?: string) => api(`/crm/deals?${params || ''}`),
            create: (data: any) => api('/crm/deals', { method: 'POST', body: JSON.stringify(data) }),
            move: (id: string, stageId: string) => api(`/crm/deals/${id}/move`, { method: 'POST', body: JSON.stringify({ stageId }) }),
        },
        contacts: {
            list: (params?: string) => api(`/crm/contacts?${params || ''}`),
            create: (data: any) => api('/crm/contacts', { method: 'POST', body: JSON.stringify(data) }),
        },
    },
    ai: {
        chat: (data: any) => api('/ai/chat', { method: 'POST', body: JSON.stringify(data) }),
        conversations: {
            list: () => api('/ai/conversations'),
            messages: (id: string) => api(`/ai/conversations/${id}/messages`),
        },
        mcp: {
            tools: () => api('/mcp/tools'),
            execute: (toolName: string, params: any) => api(`/mcp/tools/${toolName}`, { method: 'POST', body: JSON.stringify({ params }) }),
        },
    },
};
