'use client';

import { useState } from 'react';
import { Key, Copy, Check, Eye, EyeOff, Trash2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ApiKey {
    id: string;
    name: string;
    key: string;
    permissions: string[];
    lastUsed: string | null;
    status: 'active' | 'revoked';
    createdAt: string;
}

const initialKeys: ApiKey[] = [
    { id: '1', name: 'Produção', key: 'evt_live_8a7f3b2c1d...', permissions: ['events.read', 'events.write', 'attendees.read'], lastUsed: '15/07/2026', status: 'active', createdAt: '01/01/2026' },
    { id: '2', name: 'Desenvolvimento', key: 'evt_test_4e5f6a7b8c...', permissions: ['events.read', 'attendees.read'], lastUsed: '14/07/2026', status: 'active', createdAt: '15/03/2026' },
    { id: '3', name: 'Integração CRM', key: 'evt_live_9d0e1f2a3b...', permissions: ['crm.read', 'crm.write'], lastUsed: '10/07/2026', status: 'active', createdAt: '20/04/2026' },
];

const allPermissions = [
    { value: 'events.read', label: 'Ler eventos' },
    { value: 'events.write', label: 'Escrever eventos' },
    { value: 'attendees.read', label: 'Ler participantes' },
    { value: 'attendees.write', label: 'Escrever participantes' },
    { value: 'checkin.read', label: 'Ler check-ins' },
    { value: 'checkin.write', label: 'Realizar check-in' },
    { value: 'orders.read', label: 'Ler pedidos' },
    { value: 'crm.read', label: 'Ler CRM' },
    { value: 'crm.write', label: 'Escrever CRM' },
    { value: 'analytics.read', label: 'Ler analytics' },
];

export default function ApiKeysPage() {
    const [keys, setKeys] = useState(initialKeys);
    const [showCreate, setShowCreate] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);
    const [showKey, setShowKey] = useState<string | null>(null);

    function handleCreate() {
        if (!newKeyName.trim()) {
            toast.error('Nome da chave é obrigatório');
            return;
        }
        if (selectedPermissions.length === 0) {
            toast.error('Selecione ao menos uma permissão');
            return;
        }
        const generatedKey = `evt_${Math.random().toString(36).substring(2, 10)}_${Math.random().toString(36).substring(2, 18)}`;
        setNewKeyValue(generatedKey);
        const newKey: ApiKey = {
            id: Date.now().toString(),
            name: newKeyName,
            key: generatedKey.substring(0, 20) + '...',
            permissions: selectedPermissions,
            lastUsed: null,
            status: 'active',
            createdAt: new Date().toLocaleDateString('pt-BR'),
        };
        setKeys(prev => [newKey, ...prev]);
        toast.success('Chave API criada com sucesso');
    }

    function handleCopy(key: string) {
        navigator.clipboard.writeText(key);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
        toast.success('Chave copiada para a área de transferência');
    }

    function handleRevoke(id: string) {
        setKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'revoked' as const } : k));
        setConfirmRevoke(null);
        toast.success('Chave revogada com sucesso');
    }

    function togglePermission(value: string) {
        setSelectedPermissions(prev =>
            prev.includes(value)
                ? prev.filter(p => p !== value)
                : [...prev, value]
        );
    }

    function closeCreate() {
        setShowCreate(false);
        setNewKeyName('');
        setSelectedPermissions([]);
        setNewKeyValue(null);
    }

    return (
        <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">API Keys</h1>
                    <p className="text-sm text-gray-500 mt-1">Gerencie chaves de API para integrações</p>
                </div>
                <Button onClick={() => setShowCreate(true)}>
                    <Plus size={16} />
                    Nova Chave
                </Button>
            </div>

            {showCreate && (
                <Card className="mb-6 border-primary-200">
                    {newKeyValue ? (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Chave Criada</h3>
                            <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                                Copie esta chave agora. Ela não será mostrada novamente.
                            </p>
                            <div className="flex items-center gap-2 mb-3">
                                <code className="flex-1 px-4 py-3 bg-gray-900 text-gray-100 rounded-lg text-sm font-mono break-all">
                                    {newKeyValue}
                                </code>
                                <button
                                    onClick={() => handleCopy(newKeyValue)}
                                    className="p-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    {copiedKey === newKeyValue ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                                </button>
                            </div>
                            <Button variant="outline" onClick={closeCreate}>Fechar</Button>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold">Criar Nova Chave API</h3>
                                <button onClick={closeCreate} className="text-gray-400 hover:text-gray-600">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                    <input
                                        type="text"
                                        value={newKeyName}
                                        onChange={(e) => setNewKeyName(e.target.value)}
                                        placeholder="Ex: Produção, Teste, Integração..."
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Permissões</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {allPermissions.map((perm) => (
                                            <label
                                                key={perm.value}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${selectedPermissions.includes(perm.value) ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPermissions.includes(perm.value)}
                                                    onChange={() => togglePermission(perm.value)}
                                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                />
                                                {perm.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleCreate}>Criar Chave</Button>
                                    <Button variant="outline" onClick={closeCreate}>Cancelar</Button>
                                </div>
                            </div>
                        </>
                    )}
                </Card>
            )}

            {confirmRevoke && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-semibold mb-2">Revogar Chave</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Tem certeza que deseja revogar a chave <strong>{keys.find(k => k.id === confirmRevoke)?.name}</strong>?
                            Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => setConfirmRevoke(null)}>Cancelar</Button>
                            <Button variant="danger" size="sm" onClick={() => handleRevoke(confirmRevoke)}>
                                <Trash2 size={14} /> Revogar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {keys.map((apiKey) => (
                    <div key={apiKey.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg mt-1">
                                    <Key size={18} className="text-gray-600" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium">{apiKey.name}</p>
                                        <Badge variant={apiKey.status === 'active' ? 'success' : 'error'}>
                                            {apiKey.status === 'active' ? 'Ativa' : 'Revogada'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <code className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-0.5 rounded">
                                            {showKey === apiKey.id ? apiKey.key.replace('...', '') : apiKey.key}
                                        </code>
                                        <button
                                            onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            {showKey === apiKey.id ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {apiKey.permissions.map((perm) => (
                                            <span key={perm} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                                                {allPermissions.find(p => p.value === perm)?.label || perm}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Criada em {apiKey.createdAt}
                                        {apiKey.lastUsed && ` · Último uso: ${apiKey.lastUsed}`}
                                    </p>
                                </div>
                            </div>
                            {apiKey.status === 'active' && (
                                <button
                                    onClick={() => setConfirmRevoke(apiKey.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
