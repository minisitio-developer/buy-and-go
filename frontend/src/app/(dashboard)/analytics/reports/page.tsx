'use client';

import { useState } from 'react';
import { FileText, Download, Clock, Calendar, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type ReportType = 'financial' | 'attendance' | 'sponsors' | 'custom';
type ReportFormat = 'pdf' | 'csv' | 'xlsx';
type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';

const reportTypes: { value: ReportType; label: string }[] = [
    { value: 'financial', label: 'Financeiro' },
    { value: 'attendance', label: 'Presença' },
    { value: 'sponsors', label: 'Patrocinadores' },
    { value: 'custom', label: 'Personalizado' },
];

const generatedReports = [
    { id: '1', name: 'Relatório Financeiro - Julho', type: 'financial', format: 'pdf', date: '15/07/2026', status: 'completed', size: '2.4 MB' },
    { id: '2', name: 'Presença por Horário - Evento Tech', type: 'attendance', format: 'csv', date: '14/07/2026', status: 'completed', size: '1.1 MB' },
    { id: '3', name: 'ROI Patrocinadores - Q2', type: 'sponsors', format: 'xlsx', date: '10/07/2026', status: 'completed', size: '3.7 MB' },
    { id: '4', name: 'Relatório Personalizado - Anual', type: 'custom', format: 'pdf', date: '01/07/2026', status: 'generating', size: '—' },
];

export default function ReportsPage() {
    const [reportType, setReportType] = useState<ReportType>('financial');
    const [format, setFormat] = useState<ReportFormat>('pdf');
    const [recurrence, setRecurrence] = useState<Recurrence>('none');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reports, setReports] = useState(generatedReports);
    const [generating, setGenerating] = useState(false);

    function handleGenerate() {
        setGenerating(true);
        setTimeout(() => {
            const newReport = {
                id: Date.now().toString(),
                name: `Relatório ${reportTypes.find(r => r.value === reportType)?.label} - ${new Date().toLocaleDateString('pt-BR')}`,
                type: reportType,
                format,
                date: new Date().toLocaleDateString('pt-BR'),
                status: 'completed' as const,
                size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
            };
            setReports(prev => [newReport, ...prev]);
            setGenerating(false);
            toast.success('Relatório gerado com sucesso');
        }, 2000);
    }

    function handleDelete(id: string) {
        setReports(prev => prev.filter(r => r.id !== id));
        toast.success('Relatório removido');
    }

    function handleDownload(report: typeof generatedReports[0]) {
        toast.success(`Download de "${report.name}" iniciado`);
    }

    const typeLabel: Record<string, string> = {
        financial: 'Financeiro',
        attendance: 'Presença',
        sponsors: 'Patrocinadores',
        custom: 'Personalizado',
    };

    const formatLabel: Record<string, string> = {
        pdf: 'PDF',
        csv: 'CSV',
        xlsx: 'XLSX',
    };

    const statusVariant: Record<string, 'success' | 'warning'> = {
        completed: 'success',
        generating: 'warning',
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Gerador de Relatórios</h1>
            </div>

            <Card className="mb-6">
                <h2 className="text-lg font-semibold mb-4">Novo Relatório</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value as ReportType)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        >
                            {reportTypes.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Formato</label>
                        <div className="flex gap-2">
                            {(['pdf', 'csv', 'xlsx'] as ReportFormat[]).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFormat(f)}
                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${format === f ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    {f.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recorrência</label>
                    <div className="flex gap-2">
                        {([{ value: 'none', label: 'Sem recorrência' }, { value: 'daily', label: 'Diário' }, { value: 'weekly', label: 'Semanal' }, { value: 'monthly', label: 'Mensal' }] as { value: Recurrence; label: string }[]).map((r) => (
                            <button
                                key={r.value}
                                onClick={() => setRecurrence(r.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${recurrence === r.value ? 'bg-primary-50 text-primary-700 border-primary-300' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>

                <Button onClick={handleGenerate} loading={generating} className="w-full md:w-auto">
                    <FileText size={16} />
                    {generating ? 'Gerando...' : 'Gerar Relatório'}
                </Button>
            </Card>

            <Card>
                <h2 className="text-lg font-semibold mb-4">Relatórios Gerados</h2>
                {reports.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <FileText size={48} className="mx-auto text-gray-300 mb-2" />
                        <p>Nenhum relatório gerado</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reports.map((report) => (
                            <div
                                key={report.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white rounded-lg border border-gray-200">
                                        <FileText size={20} className="text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{report.name}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                            <span>{typeLabel[report.type]}</span>
                                            <span>{formatLabel[report.format]}</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {report.date}
                                            </span>
                                            <span>{report.size}</span>
                                            <Badge variant={statusVariant[report.status] || 'neutral'}>
                                                {report.status === 'completed' ? 'Concluído' : 'Gerando...'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {report.status === 'completed' && (
                                        <>
                                            <button
                                                onClick={() => handleDownload(report)}
                                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
                                            >
                                                <Download size={16} />
                                            </button>
                                            <button
                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => handleDelete(report.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
