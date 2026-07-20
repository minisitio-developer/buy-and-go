import Link from 'next/link';
import { TrendingUp, Users } from 'lucide-react';

export default function CrmPage() {
    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">CRM</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/crm/deals" className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-100 rounded-lg">
                            <TrendingUp size={24} className="text-primary-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Negociações</h2>
                            <p className="text-sm text-gray-500">Pipeline de vendas e deals</p>
                        </div>
                    </div>
                </Link>
                <Link href="/crm/contacts" className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Users size={24} className="text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Contatos</h2>
                            <p className="text-sm text-gray-500">Base de contatos e leads</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
