'use client';

import { useEffect, useState } from 'react';
import { Plus, TrendingUp } from 'lucide-react';
import { eventosApi } from '@/lib/api';

export default function DealsPage() {
    const [deals, setDeals] = useState<any[]>([]);

    useEffect(() => {
        const orgId = localStorage.getItem('organization_id') || 'default';
        eventosApi.crm.deals.list(`organizationId=${orgId}`)
            .then(setDeals)
            .catch(() => {});
    }, []);

    const stageNames: Record<string, string> = {
        'prospecting': 'Prospecção',
        'qualification': 'Qualificação',
        'proposal': 'Proposta',
        'negotiation': 'Negociação',
        'closed_won': 'Ganho',
        'closed_lost': 'Perdido',
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Negociações</h1>
                <button className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700">
                    <Plus size={18} /> Nova Negociação
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Título</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Valor</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Estágio</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Contato</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Previsão</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deals.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-12 text-gray-500">
                                <TrendingUp size={48} className="mx-auto text-gray-300 mb-2" />
                                Nenhuma negociação
                            </td></tr>
                        ) : (
                            deals.map((deal: any) => (
                                <tr key={deal.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium">{deal.title}</td>
                                    <td className="px-6 py-4 text-sm">R$ {Number(deal.value).toLocaleString('pt-BR')}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                            {stageNames[deal.stage?.name] || deal.stage?.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{deal.contact?.name || '—'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {deal.expectedClose ? new Date(deal.expectedClose).toLocaleDateString('pt-BR') : '—'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
