'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, CalendarDays, ShoppingCart, BarChart3,
    Bot, Settings, LogOut, QrCode, TrendingUp, X,
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Eventos', href: '/events', icon: CalendarDays },
    { name: 'Credenciamento', href: '/checkin', icon: QrCode },
    { name: 'Vendas', href: '/orders', icon: ShoppingCart },
    { name: 'CRM', href: '/crm', icon: TrendingUp },
    { name: 'Relatórios', href: '/analytics', icon: BarChart3 },
    { name: 'AI Assistente', href: '/ai', icon: Bot },
    { name: 'Configurações', href: '/settings', icon: Settings },
];

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
    const pathname = usePathname();

    function handleLogout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
    }

    return (
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                <h1 className="text-xl font-bold text-primary-600">EventOS AI</h1>
                <button onClick={onClose} className="lg:hidden">
                    <X size={20} />
                </button>
            </div>
            <nav className="p-4 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <item.icon size={18} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                    <LogOut size={18} />
                    Sair
                </button>
            </div>
        </aside>
    );
}
