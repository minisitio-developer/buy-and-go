'use client';

import { useEffect, useState } from 'react';
import { Users, Search, Plus } from 'lucide-react';
import { eventosApi } from '@/lib/api';

export default function ContactsPage() {
    const [contacts, setContacts] = useState<any[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const orgId = localStorage.getItem('organization_id') || 'default';
        eventosApi.crm.contacts.list(`organizationId=${orgId}&perPage=100`)
            .then(d => setContacts(d.data || []))
            .catch(() => {});
    }, []);

    const filtered = contacts.filter((c: any) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.email && c.email.includes(search.toLowerCase()))
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Contatos</h1>
                <button className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700">
                    <Plus size={18} /> Novo Contato
                </button>
            </div>

            <div className="relative mb-6">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar contatos..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Nome</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Email</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Empresa</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Telefone</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Origem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-12 text-gray-500">
                                <Users size={48} className="mx-auto text-gray-300 mb-2" />
                                Nenhum contato encontrado
                            </td></tr>
                        ) : (
                            filtered.map((c: any) => (
                                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium">{c.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{c.email || '—'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{c.company || '—'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{c.phone || '—'}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-0.5 rounded-full text-xs bg-gray-100">{c.source || '—'}</span></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
