'use client';

import { Menu } from 'lucide-react';

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    return (
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 h-16 flex items-center px-6">
            <button onClick={onMenuClick} className="lg:hidden mr-4">
                <Menu size={20} />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Organizador</span>
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">E</span>
                </div>
            </div>
        </header>
    );
}
