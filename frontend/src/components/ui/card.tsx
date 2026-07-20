import { clsx } from 'clsx';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'sm' | 'md' | 'lg';
}

const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

export function Card({ children, className, padding = 'md' }: CardProps) {
    return (
        <div className={clsx('bg-white rounded-xl border border-gray-200', paddings[padding], className)}>
            {children}
        </div>
    );
}
