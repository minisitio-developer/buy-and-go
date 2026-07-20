'use client';

import { useState } from 'react';
import { Plug, ChevronRight, X, Check, AlertCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Integration {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    status: 'disconnected' | 'connected' | 'error';
    configFields: { key: string; label: string; type: string; placeholder: string }[];
}

const integrations: Integration[] = [
    {
        id: 'stripe', name: 'Stripe', description: 'Processamento de pagamentos com cartão de crédito', icon: '💳',
        category: 'Pagamentos', status: 'connected',
        configFields: [
            { key: 'publishableKey', label: 'Publishable Key', type: 'text', placeholder: 'pk_live_...' },
            { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'sk_live_...' },
            { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', placeholder: 'whsec_...' },
        ],
    },
    {
        id: 'asaas', name: 'Asaas', description: 'Gateway de pagamentos brasileiro (PIX, boleto)', icon: '🏦',
        category: 'Pagamentos', status: 'connected',
        configFields: [
            { key: 'apiKey', label: 'API Key', type: 'password', placeholder: '$aact_...' },
            { key: 'walletId', label: 'Wallet ID', type: 'text', placeholder: 'wallet_...' },
        ],
    },
    {
        id: 'mercadopago', name: 'Mercado Pago', description: 'Pagamentos via Pix, cartão e boleto', icon: '🟡',
        category: 'Pagamentos', status: 'disconnected',
        configFields: [
            { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'APP_USR-...' },
            { key: 'publicKey', label: 'Public Key', type: 'text', placeholder: 'APP_USR-...' },
        ],
    },
    {
        id: 'zoom', name: 'Zoom', description: 'Webinars e videoconferências para eventos online', icon: '🎥',
        category: 'Comunicação', status: 'disconnected',
        configFields: [
            { key: 'clientId', label: 'Client ID', type: 'text', placeholder: '...' },
            { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: '...' },
            { key: 'accountId', label: 'Account ID', type: 'text', placeholder: '...' },
        ],
    },
    {
        id: 'googleCalendar', name: 'Google Calendar', description: 'Sincronize agendas e programações', icon: '📅',
        category: 'Produtividade', status: 'connected',
        configFields: [
            { key: 'clientId', label: 'Client ID', type: 'text', placeholder: '...apps.googleusercontent.com' },
            { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'GOCSPX-...' },
        ],
    },
    {
        id: 'salesforce', name: 'Salesforce', description: 'CRM empresarial para leads e contatos', icon: '☁️',
        category: 'CRM', status: 'error',
        configFields: [
            { key: 'clientId', label: 'Consumer Key', type: 'text', placeholder: '3MVG9...' },
            { key: 'clientSecret', label: 'Consumer Secret', type: 'password', placeholder: '...' },
            { key: 'username', label: 'Username', type: 'text', placeholder: 'user@company.com' },
        ],
    },
];

export default function IntegrationsPage() {
    const [integrationsList, setIntegrationsList] = useState(integrations);
    const [configModal, setConfigModal] = useState<Integration | null>(null);
    const [configValues, setConfigValues] = useState<Record<string, string>>({});

    function openConfig(integration: Integration) {
        setConfigModal(integration);
        setConfigValues({});
    }

    function handleConnect() {
        if (!configModal) return;
        setIntegrationsList(prev =>
            prev.map(i => i.id === configModal.id ? { ...i, status: 'connected' as const } : i)
        );
        setConfigModal(null);
        toast.success(`${configModal.name} conectado com sucesso`);
    }

    function handleDisconnect(id: string) {
        setIntegrationsList(prev =>
            prev.map(i => i.id === id ? { ...i, status: 'disconnected' as const } : i)
        );
        toast.success('Integração desconectada');
    }

    function handleRetry(id: string) {
        openConfig(integrationsList.find(i => i.id === id)!);
    }

    const statusConfig: Record<string, { variant: 'success' | 'neutral' | 'error'; label: string }> = {
        connected: { variant: 'success', label: 'Conectado' },
        disconnected: { variant: 'neutral', label: 'Desconectado' },
        error: { variant: 'error', label: 'Erro' },
    };

    return (
        <div className="max-w-4xl">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Integrações</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrationsList.map((integration) => {
                    const sc = statusConfig[integration.status];
                    return (
                        <div
                            key={integration.id}
                            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{integration.icon}</span>
                                    <div>
                                        <h3 className="font-semibold text-sm">{integration.name}</h3>
                                        <p className="text-xs text-gray-500">{integration.description}</p>
                                    </div>
                                </div>
                                <Badge variant={sc.variant}>{sc.label}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">{integration.category}</span>
                                <div className="flex gap-2">
                                    {integration.status === 'connected' ? (
                                        <button
                                            onClick={() => handleDisconnect(integration.id)}
                                            className="text-xs text-red-600 hover:underline"
                                        >
                                            Desconectar
                                        </button>
                                    ) : integration.status === 'error' ? (
                                        <button
                                            onClick={() => handleRetry(integration.id)}
                                            className="text-xs text-amber-600 hover:underline"
                                        >
                                            Reconfigurar
                                        </button>
                                    ) : null}
                                    <button
                                        onClick={() => openConfig(integration)}
                                        className="flex items-center gap-1 text-xs text-primary-600 hover:underline"
                                    >
                                        Configurar <ChevronRight size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {configModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{configModal.icon}</span>
                                <h3 className="text-lg font-semibold">{configModal.name}</h3>
                            </div>
                            <button onClick={() => setConfigModal(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">{configModal.description}</p>
                        <div className="space-y-3 mb-6">
                            {configModal.configFields.map((field) => (
                                <div key={field.key}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                                    <input
                                        type={field.type}
                                        value={configValues[field.key] || ''}
                                        onChange={(e) => setConfigValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                                        placeholder={field.placeholder}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setConfigModal(null)}>Cancelar</Button>
                            <Button onClick={handleConnect}>
                                {configModal.status === 'connected' ? 'Reconectar' : 'Conectar'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
