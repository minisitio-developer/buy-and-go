export const mockEventosApi = {
    auth: {
        register: vi.fn(),
        login: vi.fn().mockResolvedValue({
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            user: { organizationId: 'org-1' },
        }),
        refresh: vi.fn(),
    },
    events: {
        list: vi.fn(),
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        publish: vi.fn(),
        cancel: vi.fn(),
        duplicate: vi.fn(),
        remove: vi.fn(),
    },
    attendees: {
        list: vi.fn(),
        create: vi.fn(),
        batch: vi.fn(),
        remove: vi.fn(),
    },
    checkin: {
        checkIn: vi.fn(),
        stats: vi.fn(),
    },
    crm: {
        pipelines: {
            list: vi.fn(),
            create: vi.fn(),
        },
        deals: {
            list: vi.fn(),
            create: vi.fn(),
            move: vi.fn(),
        },
        contacts: {
            list: vi.fn(),
            create: vi.fn(),
        },
    },
    ai: {
        chat: vi.fn(),
        conversations: {
            list: vi.fn(),
            messages: vi.fn(),
        },
        mcp: {
            tools: vi.fn(),
            execute: vi.fn(),
        },
    },
};

vi.mock('@/lib/api', () => ({
    eventosApi: mockEventosApi,
    api: vi.fn(),
}));
