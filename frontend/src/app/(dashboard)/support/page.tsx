'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
    MessageSquare, Send, User, Bot, Loader2, Sparkles, Headphones,
    ChevronLeft, Clock, Check, Copy, Wifi, WifiOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { eventosApi } from '@/lib/api';
import { useChatWS } from '@/hooks/useChatWS';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

interface Conversation {
    id: string;
    title: string;
    messages: ChatMessage[];
    updatedAt: number;
}

const suggestedQuestions = [
    'Como faço para criar um novo evento?',
    'Quais são os planos disponíveis?',
    'Como configurar pagamentos?',
    'Preciso de ajuda com o check-in',
    'Como convidar membros da equipe?',
    'Como gerar relatórios?',
];

function generateId(): string {
    return Math.random().toString(36).substring(2, 10);
}

function formatTimestamp(ts: number): string {
    return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function SupportChatPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [useWsFallback, setUseWsFallback] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();

    const supportConvId = activeId || 'support-default';
    const {
        messages: wsMessages,
        connected: wsConnected,
        typingUsers,
        sendMessage: wsSendMessage,
        sendTyping: wsSendTyping,
        joinConversation,
        leaveConversation,
    } = useChatWS(useWsFallback ? supportConvId : undefined);

    const activeConv = conversations.find(c => c.id === activeId);
    const messages = activeConv?.messages || [];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (conversations.length === 0) {
            const firstConv: Conversation = {
                id: generateId(),
                title: 'Suporte EventOS AI',
                messages: [
                    {
                        id: generateId(),
                        role: 'assistant',
                        content: 'Olá! 👋 Sou o assistente de suporte da **EventOS AI**. Como posso ajudar você hoje? Estou aqui para tirar dúvidas sobre eventos, pagamentos, check-in e muito mais.',
                        timestamp: Date.now(),
                    },
                ],
                updatedAt: Date.now(),
            };
            setConversations([firstConv]);
            setActiveId(firstConv.id);
        }
    }, []);

    useEffect(() => {
        if (!wsConnected || !wsMessages.length) return;
        setConversations(prev => prev.map(c => {
            if (c.id !== activeId && c.id !== 'support-default') return c;
            const convId = activeId || 'support-default';
            const wsConvMessages = wsMessages
                .filter(m => m.conversationId === convId)
                .map(m => ({
                    id: m.id,
                    role: (m.senderId === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
                    content: m.content,
                    timestamp: new Date(m.timestamp).getTime(),
                }));
            const existingIds = new Set(c.messages.map(m => m.id));
            const newMessages = wsConvMessages.filter(m => !existingIds.has(m.id));
            if (!newMessages.length) return c;
            return { ...c, messages: [...c.messages, ...newMessages], updatedAt: Date.now() };
        }));
    }, [wsMessages, wsConnected, activeId]);

    function newConversation() {
        const conv: Conversation = {
            id: generateId(),
            title: 'Nova conversa',
            messages: [
                {
                    id: generateId(),
                    role: 'assistant',
                    content: 'Olá! 👋 Sou o assistente de suporte da **EventOS AI**. Como posso ajudar você hoje?',
                    timestamp: Date.now(),
                },
            ],
            updatedAt: Date.now(),
        };
        setConversations(prev => [conv, ...prev]);
        setActiveId(conv.id);
        if (!showSidebar) setShowSidebar(true);
        if (wsConnected) {
            joinConversation(conv.id);
        }
    }

    async function handleSend(text: string) {
        if (!text.trim() || loading) return;

        let convId = activeId;
        if (!convId) {
            const conv: Conversation = {
                id: generateId(),
                title: text.substring(0, 40),
                messages: [],
                updatedAt: Date.now(),
            };
            setConversations(prev => [conv, ...prev]);
            setActiveId(conv.id);
            convId = conv.id;
            if (wsConnected) {
                joinConversation(conv.id);
            }
        }

        const userMessage: ChatMessage = {
            id: generateId(),
            role: 'user',
            content: text,
            timestamp: Date.now(),
        };

        setConversations(prev => prev.map(c =>
            c.id === convId ? { ...c, messages: [...c.messages, userMessage], title: c.messages.length <= 1 ? text.substring(0, 40) + (text.length > 40 ? '...' : '') : c.title, updatedAt: Date.now() } : c
        ));
        setInput('');
        setLoading(true);

        if (wsConnected) {
            wsSendMessage(convId, text);
            setLoading(false);
            return;
        }

        try {
            const data = await eventosApi.ai.chat({ message: text, agent_type: 'support' });
            const assistantMessage: ChatMessage = {
                id: generateId(),
                role: 'assistant',
                content: data.response || 'Suporte processado com sucesso!',
                timestamp: Date.now(),
            };
            setConversations(prev => prev.map(c =>
                c.id === convId ? { ...c, messages: [...c.messages, assistantMessage], updatedAt: Date.now() } : c
            ));
        } catch {
            const errorMessage: ChatMessage = {
                id: generateId(),
                role: 'assistant',
                content: 'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente ou entre em contato pelo email suporte@eventos.ai',
                timestamp: Date.now(),
            };
            setConversations(prev => prev.map(c =>
                c.id === convId ? { ...c, messages: [...c.messages, errorMessage] } : c
            ));
        } finally {
            setLoading(false);
        }
    }

    function handleCopy(text: string, id: string) {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
        toast.success('Mensagem copiada');
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setInput(e.target.value);
        if (wsConnected && activeId) {
            wsSendTyping(activeId, e.target.value.length > 0);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                wsSendTyping(activeId, false);
            }, 2000);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(input);
        }
    }

    function formatMessage(content: string): string {
        return content
            .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm my-2"><code>$2</code></pre>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>');
    }

    const sortedConversations = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
    const showTypingIndicator = loading || (!loading && typingUsers.length > 0);

    return (
        <div className="flex h-[calc(100vh-5rem)] -m-6">
            {showSidebar && (
                <div className="w-72 border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                <Headphones size={18} className="text-primary-600" />
                            </div>
                            <h2 className="font-semibold text-sm">Suporte</h2>
                        </div>
                        <button
                            onClick={newConversation}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors"
                        >
                            <MessageSquare size={16} />
                            Nova conversa
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {sortedConversations.map(conv => (
                            <button
                                key={conv.id}
                                onClick={() => { setActiveId(conv.id); if (window.innerWidth < 1024) setShowSidebar(false); }}
                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${conv.id === activeId ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <p className="font-medium truncate">{conv.title}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {conv.messages.length} mensagens
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col bg-white">
                <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-200 bg-white">
                    {!showSidebar && (
                        <button
                            onClick={() => setShowSidebar(true)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <MessageSquare size={18} />
                        </button>
                    )}
                    <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <span className="text-sm font-medium text-gray-700">
                            {wsConnected ? 'Conectado' : 'Offline'}
                        </span>
                        {wsConnected ? (
                            <Wifi size={14} className="text-green-500" />
                        ) : (
                            <WifiOff size={14} className="text-yellow-500" />
                        )}
                    </div>
                    <span className="text-xs text-gray-400">
                        {wsConnected ? 'Tempo real ativo' : 'Usando modo de fallback'}
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-4">
                                <Headphones size={32} className="text-primary-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-1">Suporte EventOS AI</h2>
                            <p className="text-sm text-gray-500 mb-8 max-w-md">
                                Tire suas dúvidas sobre a plataforma. Escolha uma sugestão abaixo ou digite sua mensagem.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                                {suggestedQuestions.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(q)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                                    >
                                        <Sparkles size={14} />
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <Bot size={16} className="text-primary-600" />
                                        </div>
                                    )}

                                    <div className="group relative max-w-[75%]">
                                        <div className={`rounded-2xl px-5 py-3 ${msg.role === 'assistant' ? 'bg-gray-100 text-gray-800' : 'bg-primary-600 text-white'}`}>
                                            <p
                                                className="text-sm leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                                            />
                                        </div>
                                        <div className={`flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                            <button
                                                onClick={() => handleCopy(msg.content, msg.id)}
                                                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                                            >
                                                {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                                                {copiedId === msg.id ? 'Copiado' : 'Copiar'}
                                            </button>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Clock size={10} />
                                                {formatTimestamp(msg.timestamp)}
                                            </span>
                                        </div>
                                    </div>

                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <User size={16} className="text-gray-600" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {showTypingIndicator && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Bot size={16} className="text-primary-600" />
                                    </div>
                                    <div className="bg-gray-100 rounded-2xl px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <Loader2 size={16} className="animate-spin text-primary-600" />
                                            <span className="text-sm text-gray-500">
                                                {loading ? 'Suporte está digitando...' : `${typingUsers[0]?.userName || 'Alguém'} está digitando...`}
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
                    <div className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Digite sua mensagem de suporte..."
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
