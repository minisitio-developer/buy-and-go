'use client';

import { useState, useEffect } from 'react';
import { QrCode, Search, CheckCircle, XCircle, Camera } from 'lucide-react';
import { eventosApi } from '@/lib/api';

export default function CheckinPage() {
    const [mode, setMode] = useState<'qr' | 'search' | 'result'>('qr');
    const [qrInput, setQrInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        eventosApi.events.list('perPage=50&status=published')
            .then(d => setEvents(d.data || []))
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (selectedEvent) {
            eventosApi.checkin.stats(selectedEvent)
                .then(setStats)
                .catch(() => {});
        }
    }, [selectedEvent]);

    async function handleCheckIn() {
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const body: any = { eventId: selectedEvent, method: mode === 'qr' ? 'qr' : 'manual' };
            if (mode === 'qr') body.qrCode = qrInput;
            else body.document = searchTerm;

            const data = await eventosApi.checkin.checkIn(body);
            setResult(data);
            setQrInput('');
            setSearchTerm('');
        } catch (err: any) {
            if (err.message?.includes('already_checked_in')) {
                setResult({ status: 'duplicate' });
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Credenciamento</h1>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Evento</label>
                <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                    <option value="">Selecione um evento</option>
                    {events.map((e: any) => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex gap-2 mb-6">
                            <button
                                onClick={() => setMode('qr')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'qr' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                <QrCode size={16} /> QR Code
                            </button>
                            <button
                                onClick={() => setMode('search')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'search' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                <Search size={16} /> Documento
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200">
                                <Camera size={16} /> Facial
                            </button>
                        </div>

                        {mode === 'qr' ? (
                            <div>
                                <div className="flex items-center justify-center h-48 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 mb-4">
                                    <div className="text-center">
                                        <QrCode size={48} className="mx-auto text-gray-300 mb-2" />
                                        <p className="text-sm text-gray-500">Aproxime o QR Code ou digite abaixo</p>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    value={qrInput}
                                    onChange={(e) => setQrInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCheckIn()}
                                    placeholder="Código QR..."
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                        ) : (
                            <div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCheckIn()}
                                    placeholder="CPF ou documento..."
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none mb-4"
                                />
                            </div>
                        )}

                        <button
                            onClick={handleCheckIn}
                            disabled={loading || !selectedEvent || (!qrInput && !searchTerm)}
                            className="w-full mt-4 bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
                        >
                            {loading ? 'Verificando...' : 'Realizar Check-in'}
                        </button>

                        {error && (
                            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                                <XCircle size={16} /> {error}
                            </div>
                        )}

                        {result && (
                            <div className={`mt-4 p-4 rounded-lg ${result.status === 'approved' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    {result.status === 'approved' ? (
                                        <CheckCircle size={20} className="text-green-600" />
                                    ) : (
                                        <XCircle size={20} className="text-yellow-600" />
                                    )}
                                    <span className={`font-medium ${result.status === 'approved' ? 'text-green-700' : 'text-yellow-700'}`}>
                                        {result.status === 'approved' ? 'Check-in aprovado!' : 'Check-in já realizado'}
                                    </span>
                                </div>
                                {result.attendee && (
                                    <div className="text-sm text-gray-600">
                                        <p><strong>{result.attendee.name}</strong></p>
                                        <p>{result.attendee.category} {result.attendee.company ? `• ${result.attendee.company}` : ''}</p>
                                        {result.checkedInAt && <p className="text-xs mt-1">{new Date(result.checkedInAt).toLocaleString('pt-BR')}</p>}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4">Estatísticas</h2>
                    {stats ? (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Total check-ins</p>
                                <p className="text-2xl font-semibold">{stats.total || 0}</p>
                            </div>
                            {stats.byMethod && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">Por método</p>
                                    <div className="space-y-1">
                                        {stats.byMethod.map((m: any) => (
                                            <div key={m.method} className="flex justify-between text-sm">
                                                <span className="capitalize">{m.method}</span>
                                                <span className="font-medium">{m.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">Selecione um evento</p>
                    )}
                </div>
            </div>
        </div>
    );
}
