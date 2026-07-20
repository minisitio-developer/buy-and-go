import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../layout/sidebar';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
    usePathname: () => '/dashboard',
    useRouter: () => ({ push: mockPush }),
}));

describe('Sidebar', () => {
    it('renders all navigation items', () => {
        render(<Sidebar open={true} onClose={() => {}} />);

        expect(screen.getByText('EventOS AI')).toBeInTheDocument();
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Eventos')).toBeInTheDocument();
        expect(screen.getByText('Credenciamento')).toBeInTheDocument();
        expect(screen.getByText('Vendas')).toBeInTheDocument();
        expect(screen.getByText('CRM')).toBeInTheDocument();
        expect(screen.getByText('Relatórios')).toBeInTheDocument();
        expect(screen.getByText('AI Assistente')).toBeInTheDocument();
        expect(screen.getByText('Configurações')).toBeInTheDocument();
        expect(screen.getByText('Sair')).toBeInTheDocument();
    });

    it('highlights active item based on pathname', () => {
        render(<Sidebar open={true} onClose={() => {}} />);

        const dashboardLink = screen.getByText('Dashboard').closest('a');
        expect(dashboardLink).toHaveClass('bg-primary-50');
    });

    it('calls onClose when close button is clicked', () => {
        const onClose = vi.fn();
        render(<Sidebar open={true} onClose={onClose} />);

        const closeButton = screen.getByRole('button', { name: '' });
        fireEvent.click(closeButton);
    });

    it('applies translate-x-0 class when open', () => {
        const { container } = render(<Sidebar open={true} onClose={() => {}} />);
        const aside = container.querySelector('aside');
        expect(aside!.className).toContain('translate-x-0');
    });

    it('applies -translate-x-full class when closed', () => {
        const { container } = render(<Sidebar open={false} onClose={() => {}} />);
        const aside = container.querySelector('aside');
        expect(aside!.className).toContain('-translate-x-full');
    });
});
