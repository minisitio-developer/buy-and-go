'use client';

import { useState } from 'react';
import { Save, Globe, Image, Sliders, ScanFace } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
    const [orgName, setOrgName] = useState('Minha Organização');
    const [slug, setSlug] = useState('minha-organizacao');
    const [timezone, setTimezone] = useState('America/Sao_Paulo');
    const [locale, setLocale] = useState('pt-BR');
    const [checkinMode, setCheckinMode] = useState('qr');
    const [ticketValidation, setTicketValidation] = useState('strict');
    const [facialThreshold, setFacialThreshold] = useState(0.4);
    const [livenessEnabled, setLivenessEnabled] = useState(true);
    const [saving, setSaving] = useState(false);

    function handleSave() {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            toast.success('Configurações salvas com sucesso');
        }, 1000);
    }

    return (
        <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Configurações</h1>
                <Button onClick={handleSave} loading={saving}>
                    <Save size={16} />
                    Salvar
                </Button>
            </div>

            <div className="space-y-6">
                <Card>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Image size={18} className="text-gray-400" />
                        Organização
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Organização</label>
                            <input
                                type="text"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400">eventos.ai/</span>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 font-bold text-xl">
                                    {orgName.charAt(0)}
                                </div>
                                <label className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
                                    Upload Logo
                                    <input type="file" accept="image/*" className="hidden" />
                                </label>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Globe size={18} className="text-gray-400" />
                        Localização
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fuso Horário</label>
                            <select
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option value="America/Sao_Paulo">America/Sao_Paulo (GMT-3)</option>
                                <option value="America/Manaus">America/Manaus (GMT-4)</option>
                                <option value="America/Noronha">America/Noronha (GMT-2)</option>
                                <option value="America/Belem">America/Belem (GMT-3)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
                            <select
                                value={locale}
                                onChange={(e) => setLocale(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option value="pt-BR">Português (Brasil)</option>
                                <option value="en-US">English (US)</option>
                                <option value="es">Español</option>
                            </select>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Sliders size={18} className="text-gray-400" />
                        Padrões de Evento
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Modo de Check-in Padrão</label>
                            <select
                                value={checkinMode}
                                onChange={(e) => setCheckinMode(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option value="qr">QR Code</option>
                                <option value="document">Documento</option>
                                <option value="facial">Reconhecimento Facial</option>
                                <option value="mixed">Misto (QR + Documento)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Validação de Ingresso</label>
                            <select
                                value={ticketValidation}
                                onChange={(e) => setTicketValidation(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option value="strict">Restrita (validar dados completos)</option>
                                <option value="moderate">Moderada (apenas código)</option>
                                <option value="open">Livre (qualquer ingresso válido)</option>
                            </select>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ScanFace size={18} className="text-gray-400" />
                        Reconhecimento Facial
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Limiar de Correspondência: {facialThreshold.toFixed(2)}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={facialThreshold}
                                onChange={(e) => setFacialThreshold(parseFloat(e.target.value))}
                                className="w-full accent-primary-600"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>Menos preciso (0.0)</span>
                                <span>Mais preciso (1.0)</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Verificação de Vitalidade</label>
                                <p className="text-xs text-gray-400">Detecta tentativas de fraude com fotos ou vídeos</p>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={livenessEnabled}
                                onClick={() => setLivenessEnabled(!livenessEnabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    livenessEnabled ? 'bg-primary-600' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        livenessEnabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <p className="text-sm font-medium text-gray-700">Como funciona</p>
                            <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
                                <li>O participante faz o cadastro facial no momento do credenciamento</li>
                                <li>No check-in, a foto é comparada com o template cadastrado</li>
                                <li>A verificação de vitalidade impede o uso de fotos ou vídeos</li>
                                <li>Em caso de falha, o participante pode usar QR Code ou documento</li>
                            </ul>
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end">
                    <Button onClick={handleSave} loading={saving} size="lg">
                        <Save size={16} />
                        Salvar Configurações
                    </Button>
                </div>
            </div>
        </div>
    );
}
