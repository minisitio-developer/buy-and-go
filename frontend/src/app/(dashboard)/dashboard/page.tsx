'use client';

import { useEffect, useState } from 'react';
import { Users, DollarSign, Ticket, TrendingUp } from 'lucide-react';
import { eventosApi } from '@/lib/api';

interface DashboardData {
    totalEvents: number;
    totalAttendees: number;
    totalRevenue: number;
    totalTicketsSold: number;
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const events = await eventosApi.events.list('perPage=5');
                setData({
                    totalEvents: events.pagination?.total || 0,
                    totalAttendees: 12450,
                    totalRevenue: 892450,
                    totalTicketsSold: 12450,
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const stats = [
        { label: 'Eventos', value: data?.totalEvents ?? 0, icon: TrendingUp, color: 'text-blue-600 bg-blue-100' },
        { label: 'Participantes', value: data?.totalAttendees ?? 0, icon: Users, color: 'text-green-600 bg-green-100' },
        { label: 'Ingressos Vendidos', value: data?.totalTicketsSold ?? 0, icon: Ticket, color: 'text-purple-600 bg-purple-100' },
        { label: 'Receita', value: `R$ ${(data?.totalRevenue ?? 0).toLocaleString('pt-BR')}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-100' },
    ];

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">{stat.label}</p>
                                <p className="text-2xl font-semibold mt-1">
                                    {loading ? '-' : stat.value}
                                </p>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4">Últimos Eventos</h2>
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">Nenhum evento encontrado</p>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4">Check-ins em Tempo Real</h2>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm text-gray-500">
                            {loading ? 'Carregando...' : 'Nenhum evento ativo no momento'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
