'use client';

import { useState } from 'react';
import { Mail, UserPlus, Shield, MoreHorizontal, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    status: 'active' | 'invited' | 'inactive';
}

const initialMembers: TeamMember[] = [
    { id: '1', name: 'João Silva', email: 'joao@organizacao.com', avatar: 'JS', role: 'owner', status: 'active' },
    { id: '2', name: 'Maria Santos', email: 'maria@organizacao.com', avatar: 'MS', role: 'admin', status: 'active' },
    { id: '3', name: 'Pedro Oliveira', email: 'pedro@organizacao.com', avatar: 'PO', role: 'editor', status: 'active' },
    { id: '4', name: 'Ana Costa', email: 'ana@organizacao.com', avatar: 'AC', role: 'viewer', status: 'active' },
    { id: '5', name: 'Lucas Pereira', email: 'lucas@email.com', avatar: 'LP', role: 'editor', status: 'invited' },
];

const roleConfig: Record<string, { label: string; variant: 'info' | 'success' | 'warning' | 'neutral'; color: string }> = {
    owner: { label: 'Proprietário', variant: 'info', color: 'bg-blue-100 text-blue-700' },
    admin: { label: 'Admin', variant: 'success', color: 'bg-green-100 text-green-700' },
    editor: { label: 'Editor', variant: 'warning', color: 'bg-yellow-100 text-yellow-700' },
    viewer: { label: 'Visualizador', variant: 'neutral', color: 'bg-gray-100 text-gray-600' },
};

const statusConfig: Record<string, 'success' | 'warning' | 'error'> = {
    active: 'success',
    invited: 'warning',
    inactive: 'error',
};

export default function TeamPage() {
    const [members, setMembers] = useState(initialMembers);
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
    const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

    function handleInvite() {
        if (!inviteEmail.includes('@')) {
            toast.error('Email inválido');
            return;
        }
        const newMember: TeamMember = {
            id: Date.now().toString(),
            name: inviteEmail.split('@')[0],
            email: inviteEmail,
            avatar: inviteEmail.charAt(0).toUpperCase(),
            role: inviteRole,
            status: 'invited',
        };
        setMembers(prev => [...prev, newMember]);
        setInviteEmail('');
        setShowInvite(false);
        toast.success(`Convite enviado para ${inviteEmail}`);
    }

    function handleRemove(id: string) {
        const member = members.find(m => m.id === id);
        setMembers(prev => prev.filter(m => m.id !== id));
        setConfirmRemove(null);
        if (member) toast.success(`${member.name} removido da equipe`);
    }

    const roleLabels: Record<string, string> = {
        admin: 'Admin',
        editor: 'Editor',
        viewer: 'Visualizador',
    };

    return (
        <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Equipe</h1>
                    <p className="text-sm text-gray-500 mt-1">{members.length} membro{members.length !== 1 ? 's' : ''}</p>
                </div>
                <Button onClick={() => setShowInvite(true)}>
                    <UserPlus size={16} />
                    Convidar Membro
                </Button>
            </div>

            {showInvite && (
                <Card className="mb-6 border-primary-200 bg-primary-50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-sm">Convidar Novo Membro</h3>
                        <button onClick={() => setShowInvite(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="flex items-end gap-3">
                        <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="email@exemplo.com"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                                    onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Função</label>
                            <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value as any)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                            >
                                <option value="admin">Admin</option>
                                <option value="editor">Editor</option>
                                <option value="viewer">Visualizador</option>
                            </select>
                        </div>
                        <Button size="md" onClick={handleInvite}>
                            <UserPlus size={16} />
                            Convidar
                        </Button>
                    </div>
                </Card>
            )}

            {confirmRemove && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-semibold mb-2">Remover Membro</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Tem certeza que deseja remover <strong>{members.find(m => m.id === confirmRemove)?.name}</strong> da equipe?
                        </p>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => setConfirmRemove(null)}>Cancelar</Button>
                            <Button variant="danger" size="sm" onClick={() => handleRemove(confirmRemove)}>
                                <Trash2 size={14} /> Remover
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {members.map((member) => (
                    <div
                        key={member.id}
                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-sm font-semibold text-primary-700">
                                {member.avatar}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium">{member.name}</p>
                                    {member.role === 'owner' && (
                                        <Badge variant={roleConfig[member.role].variant}>{roleConfig[member.role].label}</Badge>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">{member.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {member.role !== 'owner' && (
                                <select
                                    value={member.role}
                                    className="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50"
                                    onChange={(e) => {
                                        const newRole = e.target.value as TeamMember['role'];
                                        setMembers(prev => prev.map(m => m.id === member.id ? { ...m, role: newRole } : m));
                                        toast.success(`Função de ${member.name} alterada para ${roleLabels[newRole]}`);
                                    }}
                                >
                                    {Object.entries(roleLabels).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            )}
                            <Badge variant={statusConfig[member.status]}>
                                {member.status === 'active' ? 'Ativo' : member.status === 'invited' ? 'Convidado' : 'Inativo'}
                            </Badge>
                            {member.role !== 'owner' && (
                                <button
                                    onClick={() => setConfirmRemove(member.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <MoreHorizontal size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
