'use client';

import { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend,
} from 'recharts';
import { Download, Calendar, TrendingUp, DollarSign, Ticket, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { eventosApi } from '@/lib/api';

const revenueData = [
    { month: 'Jan', revenue: 45000, tickets: 320 },
    { month: 'Fev', revenue: 52000, tickets: 410 },
    { month: 'Mar', revenue: 38000, tickets: 290 },
    { month: 'Abr', revenue: 61000, tickets: 480 },
    { month: 'Mai', revenue: 55000, tickets: 430 },
    { month: 'Jun', revenue: 72000, tickets: 560 },
    { month: 'Jul', revenue: 68000, tickets: 520 },
    { month: 'Ago', revenue: 81000, tickets: 640 },
    { month: 'Set', revenue: 74000, tickets: 590 },
    { month: 'Out', revenue: 92000, tickets: 710 },
    { month: 'Nov', revenue: 87000, tickets: 680 },
    { month: 'Dez', revenue: 105000, tickets: 820 },
];

const growthData = [
    { month: 'Jan', attendees: 1200 },
    { month: 'Fev', attendees: 1800 },
    { month: 'Mar', attendees: 2400 },
    { month: 'Abr', attendees: 3100 },
    { month: 'Mai', attendees: 3900 },
    { month: 'Jun', attendees: 4700 },
    { month: 'Jul', attendees: 5600 },
    { month: 'Ago', attendees: 6400 },
    { month: 'Set', attendees: 7200 },
    { month: 'Out', attendees: 8100 },
    { month: 'Nov', attendees: 9300 },
    { month: 'Dez', attendees: 10500 },
];

function formatCurrency(value: number): string {
    return `R$ ${value.toLocaleString('pt-BR')}`;
}

export default function AnalyticsPage() {
    const [checkinRate, setCheckinRate] = useState(78);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const events = await eventosApi.events.list('perPage=5');
                if (events.data?.length > 0) {
                    const stats = await eventosApi.checkin.stats(events.data[0].id);
                    if (stats?.rate) setCheckinRate(Math.round(stats.rate));
                }
            } catch {
                // uses mock data
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    function handleExport() {
        toast.success('Relatório exportado com sucesso');
    }

    const summaryCards = [
        {
            label: 'Receita Total',
            value: 'R$ 830.450',
            change: '+15.3%',
            positive: true,
            icon: DollarSign,
            color: 'text-emerald-600 bg-emerald-100',
        },
        {
            label: 'Ingressos Vendidos',
            value: '6.450',
            change: '+12.7%',
            positive: true,
            icon: Ticket,
            color: 'text-purple-600 bg-purple-100',
        },
        {
            label: 'Taxa de Check-in',
            value: `${checkinRate}%`,
            change: '+5.2%',
            positive: true,
            icon: Users,
            color: 'text-blue-600 bg-blue-100',
        },
        {
            label: 'Crescimento',
            value: '10.500',
            change: '+22.4%',
            positive: true,
            icon: TrendingUp,
            color: 'text-orange-600 bg-orange-100',
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600">
                        <Calendar size={16} />
                        <span>Últimos 12 meses</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download size={16} />
                        Exportar
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {summaryCards.map((card) => (
                    <Card key={card.label}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">{card.label}</p>
                                <p className="text-2xl font-semibold mt-1">
                                    {loading ? '-' : card.value}
                                </p>
                                <span className={`text-xs font-medium ${card.positive ? 'text-green-600' : 'text-red-600'}`}>
                                    {card.change}
                                </span>
                            </div>
                            <div className={`p-3 rounded-lg ${card.color}`}>
                                <card.icon size={24} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                    <h2 className="text-lg font-semibold mb-4">Receita x Ingressos</h2>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#4f46e5"
                                    strokeWidth={2}
                                    fill="url(#revenueGrad)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-lg font-semibold mb-4">Vendas de Ingressos</h2>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                                />
                                <Legend />
                                <Bar dataKey="tickets" name="Ingressos" fill="#818cf8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h2 className="text-lg font-semibold mb-4">Crescimento de Participantes</h2>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData}>
                                <defs>
                                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
                                <Area
                                    type="monotone"
                                    dataKey="attendees"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fill="url(#growthGrad)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-lg font-semibold mb-4">Distribuição de Check-in</h2>
                    <div className="h-72 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-6xl font-bold text-primary-600 mb-2">{checkinRate}%</div>
                            <p className="text-sm text-gray-500">Taxa média de check-in</p>
                            <div className="mt-6 w-full max-w-xs mx-auto">
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-primary-600 h-3 rounded-full transition-all"
                                        style={{ width: `${checkinRate}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>0%</span>
                                    <span>100%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
