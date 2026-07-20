'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, MapPin, Users, Edit3, BarChart3 } from 'lucide-react';
import { eventosApi } from '@/lib/api';

export default function EventDetailPage() {
    const { id } = useParams();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await eventosApi.events.get(id as string);
                setEvent(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        if (id) load();
    }, [id]);

    if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-64" /><div className="h-32 bg-gray-100 rounded-xl" /></div>;
    if (!event) return <p className="text-gray-500">Evento não encontrado</p>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">{event.name}</h1>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(event.startDate).toLocaleDateString('pt-BR')} — {new Date(event.endDate).toLocaleDateString('pt-BR')}
                        </span>
                        {event.city && (
                            <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {event.city}/{event.state}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Users size={14} />
                            {event.capacity ? `${event.capacity.toLocaleString()} vagas` : 'Sem limite'}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                        <Edit3 size={16} /> Editar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
                        <BarChart3 size={16} /> Dashboard
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold mb-4">Informações</h2>
                        <dl className="grid grid-cols-2 gap-4 text-sm">
                            <div><dt className="text-gray-500">Tipo</dt><dd className="font-medium capitalize">{event.type}</dd></div>
                            <div><dt className="text-gray-500">Status</dt><dd className="font-medium">{event.status}</dd></div>
                            <div><dt className="text-gray-500">Local</dt><dd className="font-medium">{event.locationName || '—'}</dd></div>
                            <div><dt className="text-gray-500">Endereço</dt><dd className="font-medium">{event.address || '—'}</dd></div>
                        </dl>
                    </div>

                    {event.schedules?.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold mb-4">Programação</h2>
                            <div className="space-y-3">
                                {event.schedules.map((s: any) => (
                                    <div key={s.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-primary-600 min-w-[80px]">
                                            {new Date(s.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{s.name}</p>
                                            {s.speaker && <p className="text-xs text-gray-500">{s.speaker}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
                        <div className="space-y-2">
                            <button className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-50">Credenciamento</button>
                            <button className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-50">Participantes</button>
                            <button className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-50">Ingressos</button>
                            <button className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-50">Relatórios</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
