'use client';

import { useState } from 'react';
import {
    CreditCard, Crown, Download, Check, X, Plus, Trash2, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const planFeatures = [
    'Até 50 eventos por ano',
    '10.000 participantes por evento',
    'Check-in ilimitado',
    'Relatórios básicos',
    'Suporte por e-mail',
];

const invoices = [
    { id: 'INV-001', date: '15/07/2026', amount: 'R$ 199,00', status: 'paid' as const },
    { id: 'INV-002', date: '15/06/2026', amount: 'R$ 199,00', status: 'paid' as const },
    { id: 'INV-003', date: '15/05/2026', amount: 'R$ 99,00', status: 'paid' as const },
    { id: 'INV-004', date: '15/04/2026', amount: 'R$ 99,00', status: 'pending' as const },
];

const paymentMethods = [
    { id: '1', type: 'credit', brand: 'Visa', last4: '4242', expDate: '12/27', isDefault: true },
    { id: '2', type: 'credit', brand: 'Mastercard', last4: '8888', expDate: '08/26', isDefault: false },
];

export default function BillingPage() {
    const [showAddCard, setShowAddCard] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardExp, setCardExp] = useState('');
    const [cardCvv, setCardCvv] = useState('');

    const usage = { events: 32, eventsLimit: 50, attendees: 8450, attendeesLimit: 10000, storage: 65, storageLimit: 100 };

    function handleUpgrade() {
        toast.success('Plano atualizado com sucesso!');
    }

    function handleDownload(id: string) {
        toast.success(`Fatura ${id} baixada`);
    }

    function handleAddCard() {
        if (!cardNumber || !cardName || !cardExp || !cardCvv) {
            toast.error('Preencha todos os campos do cartão');
            return;
        }
        toast.success('Cartão adicionado com sucesso');
        setShowAddCard(false);
        setCardNumber('');
        setCardName('');
        setCardExp('');
        setCardCvv('');
    }

    function handleRemoveCard(id: string) {
        toast.success('Cartão removido');
    }

    function handleSetDefault(id: string) {
        toast.success('Cartão definido como padrão');
    }

    return (
        <div className="max-w-4xl">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Faturamento e Plano</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                    <Card>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Crown size={20} className="text-amber-500" />
                                    <h2 className="text-lg font-semibold">Plano Pro</h2>
                                </div>
                                <p className="text-sm text-gray-500">R$ 199/mês</p>
                            </div>
                            <Badge variant="success">Ativo</Badge>
                        </div>
                        <ul className="space-y-2 mb-6">
                            {planFeatures.map((feat) => (
                                <li key={feat} className="flex items-center gap-2 text-sm text-gray-600">
                                    <Check size={16} className="text-green-500" />
                                    {feat}
                                </li>
                            ))}
                        </ul>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleUpgrade}>Fazer Upgrade</Button>
                            <Button variant="ghost" size="sm">Ver Planos</Button>
                        </div>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Uso do Plano</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-500">Eventos</span>
                                    <span className="font-medium">{usage.events}/{usage.eventsLimit}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${(usage.events / usage.eventsLimit) * 100}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-500">Participantes</span>
                                    <span className="font-medium">{usage.attendees.toLocaleString()}/{usage.attendeesLimit.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(usage.attendees / usage.attendeesLimit) * 100}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-500">Armazenamento</span>
                                    <span className="font-medium">{usage.storage}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${usage.storage}%` }} />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <Card className="mb-6">
                <h2 className="text-lg font-semibold mb-4">Faturas</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Fatura</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Data</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Valor</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium">{inv.id}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{inv.date}</td>
                                    <td className="px-4 py-3 text-sm">{inv.amount}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>
                                            {inv.status === 'paid' ? 'Pago' : 'Pendente'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => handleDownload(inv.id)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100 transition-colors">
                                            <Download size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Métodos de Pagamento</h2>
                    <Button variant="outline" size="sm" onClick={() => setShowAddCard(true)}>
                        <Plus size={16} /> Adicionar Cartão
                    </Button>
                </div>

                {showAddCard && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <h3 className="text-sm font-medium mb-3">Novo Cartão</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div className="md:col-span-2">
                                <label className="block text-xs text-gray-500 mb-1">Número do Cartão</label>
                                <input
                                    type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)}
                                    placeholder="4242 4242 4242 4242"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs text-gray-500 mb-1">Nome no Cartão</label>
                                <input
                                    type="text" value={cardName} onChange={(e) => setCardName(e.target.value)}
                                    placeholder="Nome como está no cartão"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Validade</label>
                                <input
                                    type="text" value={cardExp} onChange={(e) => setCardExp(e.target.value)}
                                    placeholder="MM/AA"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">CVV</label>
                                <input
                                    type="text" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)}
                                    placeholder="123"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleAddCard}>Adicionar</Button>
                            <Button variant="ghost" size="sm" onClick={() => setShowAddCard(false)}>Cancelar</Button>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    {paymentMethods.map((pm) => (
                        <div key={pm.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg border border-gray-200">
                                    <CreditCard size={20} className="text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">
                                        {pm.brand} •••• {pm.last4}
                                        {pm.isDefault && (
                                            <span className="ml-2 text-xs text-primary-600 font-medium">Padrão</span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500">Expira {pm.expDate}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!pm.isDefault && (
                                    <>
                                        <button
                                            onClick={() => handleSetDefault(pm.id)}
                                            className="text-xs text-primary-600 hover:underline"
                                        >
                                            Definir padrão
                                        </button>
                                        <button
                                            onClick={() => handleRemoveCard(pm.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
