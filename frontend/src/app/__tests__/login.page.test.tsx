import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../../(auth)/login/page';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
    usePathname: () => '/login',
    useRouter: () => ({ push: mockPush }),
}));

const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const originalLocation = window.location;
beforeEach(() => {
    vi.resetAllMocks();
    Object.defineProperty(window, 'location', {
        value: { ...originalLocation, href: '' },
        writable: true,
    });
    localStorageMock.clear();
});

describe('LoginPage', () => {
    it('renders login form', () => {
        render(<LoginPage />);

        expect(screen.getByText('EventOS AI')).toBeInTheDocument();
        expect(screen.getByText('Entrar')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    });

    it('shows error on failed login', async () => {
        const { eventosApi } = await import('@/lib/api');
        (eventosApi.auth.login as any).mockRejectedValueOnce(new Error('Invalid credentials'));

        render(<LoginPage />);

        const user = userEvent.setup();
        await user.type(screen.getByPlaceholderText('seu@email.com'), 'test@test.com');
        await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpass');
        await user.click(screen.getByRole('button', { name: /entrar/i }));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
    });

    it('stores tokens and redirects on successful login', async () => {
        const { eventosApi } = await import('@/lib/api');
        (eventosApi.auth.login as any).mockResolvedValueOnce({
            accessToken: 'test-access-token',
            refreshToken: 'test-refresh-token',
            user: { organizationId: 'org-1' },
        });

        render(<LoginPage />);

        const user = userEvent.setup();
        await user.type(screen.getByPlaceholderText('seu@email.com'), 'admin@eventos.ai');
        await user.type(screen.getByPlaceholderText('••••••••'), 'correctpass');
        await user.click(screen.getByRole('button', { name: /entrar/i }));

        await waitFor(() => {
            expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'test-access-token');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', 'test-refresh-token');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('organization_id', 'org-1');
            expect(window.location.href).toBe('/dashboard');
        });
    });

    it('toggles password visibility', async () => {
        render(<LoginPage />);

        const passwordInput = screen.getByPlaceholderText('••••••••');
        expect(passwordInput).toHaveAttribute('type', 'password');

        const toggleButton = screen.getByRole('button', { name: '' });
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');

        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('disables submit button while loading', async () => {
        const { eventosApi } = await import('@/lib/api');
        (eventosApi.auth.login as any).mockImplementationOnce(
            () => new Promise((resolve) => setTimeout(() => resolve({}), 1000)),
        );

        render(<LoginPage />);

        const user = userEvent.setup();
        await user.type(screen.getByPlaceholderText('seu@email.com'), 'test@test.com');
        await user.type(screen.getByPlaceholderText('••••••••'), 'password');
        await user.click(screen.getByRole('button', { name: /entrar/i }));

        const button = screen.getByRole('button', { name: /entrando/i });
        expect(button).toBeDisabled();
    });

    it('renders register and forgot password links', () => {
        render(<LoginPage />);

        expect(screen.getByText('Criar conta')).toBeInTheDocument();
        expect(screen.getByText('Esqueci senha')).toBeInTheDocument();
    });
});
