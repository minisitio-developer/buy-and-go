'use client';

import { useState, useRef, useEffect, createElement } from 'react';
import {
    Bot, Send, User, Sparkles, Loader2, MessageSquare, Plus,
    Trash2, Code, Copy, Check, ChevronDown, Zap, BarChart3,
    TrendingUp, Headphones, DollarSign, CalendarDays, X, PanelLeftClose, PanelLeft,
} from 'lucide-react';
import { eventosApi } from '@/lib/api';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    agent_type?: string;
    tool_calls?: Array<{ tool: string; result: any }>;
    timestamp: number;
}

interface Conversation {
    id: string;
    title: string;
    agent_type: string;
    messages: Message[];
    created_at: number;
}

type AgentType = 'organizer' | 'marketing' | 'analytics' | 'crm' | 'support' | 'sponsor';

interface AgentConfig {
    type: AgentType;
    label: string;
    description: string;
    icon: any;
    color: string;
}

const agents: AgentConfig[] = [
    { type: 'organizer', label: 'Organizador', description: 'Criação e gestão de eventos', icon: CalendarDays, color: 'bg-violet-500' },
    { type: 'marketing', label: 'Marketing', description: 'Campanhas e divulgação', icon: Zap, color: 'bg-pink-500' },
    { type: 'analytics', label: 'Analytics', description: 'Dados e relatórios', icon: BarChart3, color: 'bg-blue-500' },
    { type: 'crm', label: 'CRM', description: 'Vendas e relacionamento', icon: TrendingUp, color: 'bg-emerald-500' },
    { type: 'support', label: 'Suporte', description: 'Atendimento ao participante', icon: Headphones, color: 'bg-amber-500' },
    { type: 'sponsor', label: 'Patrocinador', description: 'Inteligência de patrocínio', icon: DollarSign, color: 'bg-cyan-500' },
];

const agentSuggestions: Record<AgentType, string[]> = {
    organizer: [
        'Crie um congresso médico para 8.000 pessoas em Brasília por 3 dias',
        'Quero organizar um workshop de tecnologia para 200 pessoas',
        'Crie uma feira de negócios com 50 expositores',
    ],
    marketing: [
        'Crie uma campanha de e-mail para o evento',
        'Gere posts para Instagram sobre o congresso',
        'Sugira estratégias para aumentar vendas',
    ],
    analytics: [
        'Quantos ingressos vendemos hoje?',
        'Qual foi o horário de pico do credenciamento?',
        'Mostre o relatório de ocupação do evento',
    ],
    crm: [
        'Quais leads estão quentes no pipeline?',
        'Crie uma tarefa de follow-up para o contato XYZ',
        'Qual o ticket médio dos nossos deals?',
    ],
    support: [
        'Como faço para emitir meu certificado?',
        'Qual o horário de abertura do evento?',
        'Preciso trocar meu ingresso para outro lote',
    ],
    sponsor: [
        'Quantas pessoas visitaram nosso estande?',
        'Qual o perfil dos visitantes?',
        'Compare nosso ROI com outros patrocinadores',
    ],
};

function formatTimestamp(ts: number): string {
    const d = new Date(ts);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function generateId(): string {
    return Math.random().toString(36).substring(2, 10);
}

function formatMessage(content: string): string {
    return content
        .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm my-2"><code>$2</code></pre>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br/>');
}

export default function AiChatPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<AgentType>('organizer');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showAgentMenu, setShowAgentMenu] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const activeConversation = conversations.find(c => c.id === activeConversationId);
    const messages = activeConversation?.messages || [];
    const isFirstMessage = messages.length <= 1;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!activeConversationId && conversations.length > 0) {
            setActiveConversationId(conversations[0].id);
        }
    }, [conversations, activeConversationId]);

    function createConversation(agentType: AgentType): string {
        const id = generateId();
        const newConversation: Conversation = {
            id,
            title: agents.find(a => a.type === agentType)?.label || 'AI',
            agent_type: agentType,
            messages: [{ id: generateId(), role: 'assistant', content: `Olá! Sou o assistente **${agents.find(a => a.type === agentType)?.label}**. ${agents.find(a => a.type === agentType)?.description}. Como posso ajudar?`, timestamp: Date.now() }],
            created_at: Date.now(),
        };
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversationId(id);
        return id;
    }

    useEffect(() => {
        if (conversations.length === 0) {
            createConversation(selectedAgent);
        }
    }, []);

    async function handleSend(text: string) {
        if (!text.trim() || loading) return;

        let convId = activeConversationId;
        if (!convId) {
            convId = createConversation(selectedAgent);
        }

        const userMessage: Message = {
            id: generateId(),
            role: 'user',
            content: text,
            timestamp: Date.now(),
        };

        setConversations(prev => prev.map(c =>
            c.id === convId ? { ...c, messages: [...c.messages, userMessage] } : c
        ));
        setInput('');
        setLoading(true);

        try {
            const data = await eventosApi.ai.chat({
                agent_type: selectedAgent,
                message: text,
                event_id: null,
                conversation_id: convId,
            });
            const assistantMessage: Message = {
                id: generateId(),
                role: 'assistant',
                content: data.response || 'Processado com sucesso!',
                agent_type: selectedAgent,
                timestamp: Date.now(),
            };

            setConversations(prev => prev.map(c =>
                c.id === convId
                    ? {
                        ...c,
                        title: c.messages.length <= 2 ? text.substring(0, 40) + (text.length > 40 ? '...' : '') : c.title,
                        messages: [...c.messages, assistantMessage],
                    }
                    : c
            ));
        } catch {
            const errorMessage: Message = {
                id: generateId(),
                role: 'assistant',
                content: 'Desculpe, ocorreu um erro ao processar sua solicitação. Verifique sua conexão e tente novamente.',
                timestamp: Date.now(),
            };
            setConversations(prev => prev.map(c =>
                c.id === convId ? { ...c, messages: [...c.messages, errorMessage] } : c
            ));
        } finally {
            setLoading(false);
        }
    }

    function handleAgentChange(agentType: AgentType) {
        setSelectedAgent(agentType);
        setShowAgentMenu(false);
        createConversation(agentType);
        inputRef.current?.focus();
    }

    function deleteConversation(id: string) {
        setConversations(prev => prev.filter(c => c.id !== id));
        if (activeConversationId === id) {
            const remaining = conversations.filter(c => c.id !== id);
            if (remaining.length > 0) {
                setActiveConversationId(remaining[0].id);
            } else {
                setActiveConversationId(null);
            }
        }
    }

    function handleCopy(text: string, id: string) {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(input);
        }
    }

    const currentAgentConfig = agents.find(a => a.type === selectedAgent)!;

    return (
        <div className="flex h-[calc(100vh-5rem)] -m-6">
            {sidebarOpen && (
                <div className="w-72 border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
                    <div className="p-4 border-b border-gray-200">
                        <button
                            onClick={() => createConversation(selectedAgent)}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors"
                        >
                            <Plus size={16} />
                            Nova conversa
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {conversations.map(conv => {
                            const agentIcon = agents.find(a => a.type === conv.agent_type)?.icon || Bot;
                            const agentColor = agents.find(a => a.type === conv.agent_type)?.color || 'bg-gray-500';
                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => setActiveConversationId(conv.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors group ${conv.id === activeConversationId ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    <div className={`w-7 h-7 ${agentColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                        {createElement(agentIcon, { size: 14, className: 'text-white' })}
                                    </div>
                                    <span className="flex-1 truncate">{conv.title}</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col bg-white">
                <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowAgentMenu(!showAgentMenu)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <div className={`w-2.5 h-2.5 rounded-full ${currentAgentConfig.color}`} />
                                <span className="text-sm font-medium text-gray-700">{currentAgentConfig.label}</span>
                                <ChevronDown size={14} className="text-gray-400" />
                            </button>

                            {showAgentMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowAgentMenu(false)} />
                                    <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
                                        {agents.map(agent => (
                                            <button
                                                key={agent.type}
                                                onClick={() => handleAgentChange(agent.type)}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${agent.type === selectedAgent ? 'bg-primary-50 text-primary-700' : 'text-gray-700'}`}
                                            >
                                                <div className={`w-7 h-7 ${agent.color} rounded-lg flex items-center justify-center`}>
                                                    {createElement(agent.icon, { size: 14, className: 'text-white' })}
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-medium">{agent.label}</p>
                                                    <p className="text-xs text-gray-400">{agent.description}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {activeConversation && (
                        <span className="text-xs text-gray-400">
                            {messages.length} mensagens
                        </span>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className={`w-16 h-16 ${currentAgentConfig.color} rounded-2xl flex items-center justify-center mb-4`}>
                                {createElement(currentAgentConfig.icon, { size: 32, className: 'text-white' })}
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-1">
                                {currentAgentConfig.label}
                            </h2>
                            <p className="text-sm text-gray-500 mb-8 max-w-md">
                                {currentAgentConfig.description}. Escolha uma sugestão abaixo ou digite sua própria mensagem.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                                {agentSuggestions[selectedAgent].map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(s)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                                    >
                                        <Sparkles size={14} />
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto space-y-4">
                            {messages.map((msg) => {
                                const isAgent = msg.role === 'assistant';
                                const agentCfg = agents.find(a => a.type === msg.agent_type) || currentAgentConfig;
                                return (
                                    <div key={msg.id} className={`flex gap-3 ${!isAgent ? 'justify-end' : ''}`}>
                                        {isAgent && (
                                            <div className={`w-8 h-8 ${agentCfg.color} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                                                {createElement(agentCfg.icon, { size: 16, className: 'text-white' })}
                                            </div>
                                        )}

                                        <div className={`group relative max-w-[75%] ${isAgent ? 'order-1' : 'order-1'}`}>
                                            <div className={`rounded-2xl px-5 py-3 ${isAgent ? 'bg-gray-100 text-gray-800' : 'bg-primary-600 text-white'}`}>
                                                <p
                                                    className="text-sm leading-relaxed [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:text-sm"
                                                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                                                />
                                                {msg.tool_calls && msg.tool_calls.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                        {msg.tool_calls.map((tc, i) => (
                                                            <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                                                                <Zap size={12} />
                                                                <span>Executou: {tc.tool}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {isAgent && (
                                                <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleCopy(msg.content, msg.id)}
                                                        className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                                                    >
                                                        {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                                                        {copiedId === msg.id ? 'Copiado' : 'Copiar'}
                                                    </button>
                                                    <span className="text-xs text-gray-400">{formatTimestamp(msg.timestamp)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {!isAgent && (
                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                <User size={16} className="text-gray-600" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {loading && (
                                <div className="flex gap-3">
                                    <div className={`w-8 h-8 ${currentAgentConfig.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                                        {createElement(currentAgentConfig.icon, { size: 16, className: 'text-white' })}
                                    </div>
                                    <div className="bg-gray-100 rounded-2xl px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <Loader2 size={16} className="animate-spin text-primary-600" />
                                            <span className="text-sm text-gray-500">
                                                {currentAgentConfig.label} está processando...
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-200 px-6 py-4 bg-white">
                    {isFirstMessage && messages.length > 1 && (
                        <div className="mb-3">
                            <p className="text-xs text-gray-400 mb-2">Sugestões rápidas:</p>
                            <div className="flex flex-wrap gap-2">
                                {agentSuggestions[selectedAgent].map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(s)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-600 hover:bg-gray-200 transition-colors"
                                    >
                                        <Sparkles size={12} />
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`Pergunte ao ${currentAgentConfig.label}...`}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm transition-shadow"
                            disabled={loading}
                        />
                        <button
                            onClick={() => handleSend(input)}
                            disabled={!input.trim() || loading}
                            className="px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Send size={18} />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
