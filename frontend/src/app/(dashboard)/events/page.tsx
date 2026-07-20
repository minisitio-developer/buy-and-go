'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, MoreHorizontal, Calendar, MapPin } from 'lucide-react';
import { eventosApi } from '@/lib/api';

interface Event {
    id: string;
    name: string;
    slug: string;
    type: string;
    status: string;
    startDate: string;
    endDate: string;
    city: string;
    state: string;
    capacity: number;
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const data = await eventosApi.events.list('perPage=50');
                setEvents(data.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filtered = events.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase()),
    );

    const statusColor: Record<string, string> = {
        draft: 'bg-yellow-100 text-yellow-700',
        published: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
        finished: 'bg-gray-100 text-gray-600',
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Eventos</h1>
                <Link
                    href="/events/new"
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
                >
                    <Plus size={18} />
                    Novo Evento
                </Link>
            </div>

            <div className="relative mb-6">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar eventos..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Nenhum evento encontrado</p>
                    <Link href="/events/new" className="text-primary-600 text-sm hover:underline mt-2 inline-block">
                        Criar primeiro evento
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((event) => (
                        <Link
                            key={event.id}
                            href={`/events/${event.id}`}
                            className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{event.name}</h3>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {new Date(event.startDate).toLocaleDateString('pt-BR')}
                                            {' — '}
                                            {new Date(event.endDate).toLocaleDateString('pt-BR')}
                                        </span>
                                        {event.city && (
                                            <span className="flex items-center gap-1">
                                                <MapPin size={14} />
                                                {event.city}/{event.state}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[event.status] || 'bg-gray-100'}`}>
                                        {event.status === 'draft' ? 'Rascunho' :
                                            event.status === 'published' ? 'Publicado' :
                                            event.status === 'cancelled' ? 'Cancelado' :
                                            event.status === 'finished' ? 'Finalizado' : event.status}
                                    </span>
                                    <MoreHorizontal size={18} className="text-gray-400" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
