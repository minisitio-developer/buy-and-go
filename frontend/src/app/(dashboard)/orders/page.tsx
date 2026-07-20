'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Search } from 'lucide-react';
import { api } from '@/lib/api';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const data = await api('/orders?perPage=50');
                setOrders(data.data || []);
            } catch { /* ignore */ } finally { setLoading(false); }
        }
        load();
    }, []);

    const statusColor: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-700',
        confirmed: 'bg-green-100 text-green-700',
        cancelled: 'bg-gray-100 text-gray-500',
        refunded: 'bg-red-100 text-red-700',
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Vendas</h1>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar pedidos..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Pedido</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Total</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Pagamento</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="border-b border-gray-100">
                                    {Array.from({ length: 5 }).map((_, j) => (
                                        <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                                    ))}
                                </tr>
                            ))
                        ) : orders.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-12 text-gray-500">
                                <DollarSign size={48} className="mx-auto text-gray-300 mb-2" />
                                Nenhuma venda encontrada
                            </td></tr>
                        ) : (
                            orders.map((order: any) => (
                                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium">{order.id.slice(0, 8)}...</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[order.status] || 'bg-gray-100'}`}>{order.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">R$ {Number(order.total).toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{order.paymentMethod || '—'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
