'use client';

import { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Calendar, DollarSign, Ticket, Users, TrendingUp, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { eventosApi } from '@/lib/api';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const dailyCheckins = [
    { day: 'Seg', checkins: 320 },
    { day: 'Ter', checkins: 480 },
    { day: 'Qua', checkins: 560 },
    { day: 'Qui', checkins: 720 },
    { day: 'Sex', checkins: 890 },
    { day: 'Sáb', checkins: 1100 },
    { day: 'Dom', checkins: 950 },
];

const ticketTypes = [
    { name: 'VIP', value: 450 },
    { name: 'Premium', value: 680 },
    { name: 'Standard', value: 1200 },
    { name: 'Meia-Entrada', value: 340 },
    { name: 'Cortesia', value: 180 },
];

const sponsors = [
    { name: 'TechCorp', visitors: 1250, revenue: 50000 },
    { name: 'GlobalBank', visitors: 980, revenue: 35000 },
    { name: 'HealthPlus', visitors: 720, revenue: 25000 },
    { name: 'EduSoft', visitors: 540, revenue: 18000 },
    { name: 'GreenEnergy', visitors: 410, revenue: 12000 },
];

export default function EventAnalyticsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await eventosApi.events.list('perPage=50');
                setEvents(data.data || []);
                if (data.data?.length > 0) {
                    setSelectedEvent(data.data[0].id);
                }
            } catch {
                // ignore
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const metrics = [
        { label: 'Receita', value: 'R$ 248.500', change: '+18.3%', icon: DollarSign, color: 'text-emerald-600 bg-emerald-100' },
        { label: 'Ingressos Vendidos', value: '2.850', change: '+12.1%', icon: Ticket, color: 'text-purple-600 bg-purple-100' },
        { label: 'Preço Médio', value: 'R$ 87,20', change: '+5.4%', icon: TrendingUp, color: 'text-blue-600 bg-blue-100' },
        { label: 'Taxa Check-in', value: '84%', change: '+3.2%', icon: Users, color: 'text-orange-600 bg-orange-100' },
    ];

    const totalVisitors = sponsors.reduce((acc, s) => acc + s.visitors, 0);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Analytics do Evento</h1>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedEvent}
                        onChange={(e) => setSelectedEvent(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                        <option value="">Selecione um evento</option>
                        {events.map((e) => (
                            <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                    </select>
                    <Button variant="outline" size="sm">
                        <Calendar size={16} />
                        Filtrar
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {metrics.map((m) => (
                    <Card key={m.label}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">{m.label}</p>
                                <p className="text-2xl font-semibold mt-1">{loading ? '-' : m.value}</p>
                                <span className="text-xs font-medium text-green-600">{m.change}</span>
                            </div>
                            <div className={`p-3 rounded-lg ${m.color}`}>
                                <m.icon size={24} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                    <h2 className="text-lg font-semibold mb-4">Check-ins Diários</h2>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyCheckins}>
                                <defs>
                                    <linearGradient id="checkinGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
                                <Area
                                    type="monotone"
                                    dataKey="checkins"
                                    stroke="#4f46e5"
                                    strokeWidth={2}
                                    fill="url(#checkinGrad)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-lg font-semibold mb-4">Tipos de Ingresso</h2>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={ticketTypes}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {ticketTypes.map((_, idx) => (
                                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Top Patrocinadores por Visitantes</h2>
                    <Award size={20} className="text-gray-400" />
                </div>
                <div className="space-y-4">
                    {sponsors.map((sponsor, idx) => {
                        const pct = Math.round((sponsor.visitors / totalVisitors) * 100);
                        return (
                            <div key={sponsor.name} className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-400 w-6">{idx + 1}º</span>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium">{sponsor.name}</span>
                                        <span className="text-sm text-gray-500">{sponsor.visitors} visitantes</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className="bg-primary-500 h-2 rounded-full"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-emerald-600 min-w-[80px] text-right">
                                    R$ {(sponsor.revenue / 1000).toFixed(1)}k
                                </span>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}
