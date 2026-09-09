import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Printer,
  Copy,
  Edit,
  Trash2,
  Filter,
  DollarSign,
  Clock,
  Building,
  Save,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import {
  Invoice,
  InvoiceEmitter,
  InvoiceStatus,
  Account,
  CostCenter,
} from '../types/finance';
import {
  formatInvoiceCurrency,
  formatDate,
  getInvoiceTypeLabel,
  getInvoiceStatusLabel,
} from '../utils/formatters';
import { SMVMLogo } from './SMVMLogo';

interface InvoicesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  emitterSettings: InvoiceEmitter;
  accounts: Account[];
  costCenters: CostCenter[];
  onOpenNewInvoice: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
  onDuplicateInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onMarkAsPaid: (invoice: Invoice) => void;
  onSaveEmitterSettings: (settings: InvoiceEmitter) => void;
}

export const InvoicesManagerModal: React.FC<InvoicesManagerModalProps> = ({
  isOpen,
  onClose,
  invoices,
  emitterSettings,
  accounts,
  costCenters,
  onOpenNewInvoice,
  onViewInvoice,
  onEditInvoice,
  onDuplicateInvoice,
  onDeleteInvoice,
  onMarkAsPaid,
  onSaveEmitterSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'settings'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | string>('all');

  // Emitter settings local state
  const [emitterForm, setEmitterForm] = useState<InvoiceEmitter>(emitterSettings);
  const [savedSettingsSuccess, setSavedSettingsSuccess] = useState(false);

  if (!isOpen) return null;

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Search
      const matchesSearch =
        !searchQuery ||
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.client.taxId && inv.client.taxId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        inv.items.some((it) => it.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

      // Type
      const matchesType = typeFilter === 'all' || inv.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [invoices, searchQuery, statusFilter, typeFilter]);

  // Aggregate statistics
  const totalBilled = useMemo(() => {
    return invoices
      .filter((i) => i.status !== 'cancelled')
      .reduce((sum, i) => sum + i.totalAmount, 0);
  }, [invoices]);

  const totalPaid = useMemo(() => {
    return invoices
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + i.totalAmount, 0);
  }, [invoices]);

  const totalPending = useMemo(() => {
    return invoices
      .filter((i) => i.status === 'issued')
      .reduce((sum, i) => sum + i.totalAmount, 0);
  }, [invoices]);

  const totalTaxCollected = useMemo(() => {
    return invoices
      .filter((i) => i.status !== 'cancelled')
      .reduce((sum, i) => sum + i.totalTax, 0);
  }, [invoices]);

  const handleSaveEmitter = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveEmitterSettings(emitterForm);
    setSavedSettingsSuccess(true);
    setTimeout(() => setSavedSettingsSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <SMVMLogo size="md" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Gestão & Emissão de Facturas
              </h2>
              <p className="text-xs text-slate-500">
                Facturação oficial, controle de cobrança e conciliação de recebimentos da SMVM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewInvoice}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Emitir Nova Factura
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/50 flex gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'list'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Facturas Emitidas ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            Dados da Entidade Emissora (SMVM)
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'list' && (
            <>
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Total Facturado
                    </span>
                    <DollarSign className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-base font-extrabold font-mono text-slate-900 mt-1">
                    {formatInvoiceCurrency(totalBilled)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {invoices.filter((i) => i.status !== 'cancelled').length} documentos ativos
                  </div>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                      Liquidadas / Pagas
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-base font-extrabold font-mono text-emerald-800 mt-1">
                    {formatInvoiceCurrency(totalPaid)}
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">
                    Recebidas e conciliadas no caixa
                  </div>
                </div>

                <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                      Pendentes de Recebimento
                    </span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-base font-extrabold font-mono text-amber-800 mt-1">
                    {formatInvoiceCurrency(totalPending)}
                  </div>
                  <div className="text-[10px] text-amber-600 mt-0.5">
                    {invoices.filter((i) => i.status === 'issued').length} aguardando liquidação
                  </div>
                </div>

                <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                      Impostos (IVA)
                    </span>
                    <FileText className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-base font-extrabold font-mono text-indigo-800 mt-1">
                    {formatInvoiceCurrency(totalTaxCollected)}
                  </div>
                  <div className="text-[10px] text-indigo-600 mt-0.5">
                    Apuração fiscal consolidada
                  </div>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar por número, cliente, NIF..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-1 text-xs">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500">Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="px-2 py-1 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
                    >
                      <option value="all">Todos os Status</option>
                      <option value="issued">Emitidas (Pendentes)</option>
                      <option value="paid">Pagas / Liquidadas</option>
                      <option value="draft">Rascunhos</option>
                      <option value="cancelled">Canceladas</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-500">Tipo:</span>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="px-2 py-1 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
                    >
                      <option value="all">Todos os Tipos</option>
                      <option value="FT">Factura (FT)</option>
                      <option value="FR">Factura-Recibo (FR)</option>
                      <option value="FP">Pró-Forma (FP)</option>
                      <option value="NC">Nota Crédito (NC)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Invoices Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-3">Número / Tipo</th>
                        <th className="py-3 px-3">Cliente / NIF</th>
                        <th className="py-3 px-3">Emissão & Vencimento</th>
                        <th className="py-3 px-3 text-right">Total Líquido</th>
                        <th className="py-3 px-3 text-center">Estado</th>
                        <th className="py-3 px-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {filteredInvoices.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                            <p className="font-semibold text-slate-600">Nenhuma factura encontrada</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Tente ajustar os filtros ou clique em "Emitir Nova Factura".
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredInvoices.map((inv) => {
                          const isPaid = inv.status === 'paid';
                          const isDraft = inv.status === 'draft';
                          const isCancelled = inv.status === 'cancelled';

                          return (
                            <tr
                              key={inv.id}
                              className="hover:bg-slate-50/80 transition-colors group"
                            >
                              {/* Number & Type */}
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-slate-900">
                                    {inv.invoiceNumber}
                                  </span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                    {inv.type}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5">
                                  {inv.items[0]?.description}
                                </div>
                              </td>

                              {/* Client */}
                              <td className="py-3 px-3">
                                <div className="font-semibold text-slate-900">{inv.client.name}</div>
                                <div className="text-[11px] text-slate-500 font-mono">
                                  {inv.client.taxId || 'Consumidor Final'}
                                </div>
                              </td>

                              {/* Dates */}
                              <td className="py-3 px-3 font-mono text-[11px]">
                                <div className="text-slate-700">Emissão: {formatDate(inv.issueDate)}</div>
                                <div className="text-slate-500">Vencimento: {formatDate(inv.dueDate)}</div>
                              </td>

                              {/* Total Amount */}
                              <td className="py-3 px-3 text-right">
                                <span className="font-mono font-bold text-slate-900 text-sm">
                                  {formatInvoiceCurrency(inv.totalAmount, inv.currency)}
                                </span>
                                {inv.totalTax > 0 && (
                                  <div className="text-[10px] text-slate-400">
                                    IVA: {formatInvoiceCurrency(inv.totalTax, inv.currency)}
                                  </div>
                                )}
                              </td>

                              {/* Status */}
                              <td className="py-3 px-3 text-center">
                                <span
                                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                    isPaid
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : isDraft
                                      ? 'bg-slate-100 text-slate-700 border border-slate-300'
                                      : isCancelled
                                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                                  }`}
                                >
                                  {getInvoiceStatusLabel(inv.status)}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {!isPaid && !isCancelled && (
                                    <button
                                      onClick={() => onMarkAsPaid(inv)}
                                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                      title="Liquidar / Marcar como Paga"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                  )}

                                  <button
                                    onClick={() => onViewInvoice(inv)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Visualizar e Imprimir"
                                  >
                                    <Printer className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => onDuplicateInvoice(inv)}
                                    className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                                    title="Duplicar factura"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => onEditInvoice(inv)}
                                    className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                                    title="Editar factura"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => onDeleteInvoice(inv.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Excluir ou Cancelar"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Tab: Emitter Configuration */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveEmitter} className="space-y-4 max-w-3xl">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
                Configure os dados fiscais e institucionais da SMVM. Essas informações serão impressas no cabeçalho oficial de todas as facturas e recibos emitidos.
              </div>

              {savedSettingsSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Dados da entidade emissora salvos com sucesso!
                </div>
              )}

              {/* Official SMVM Logo Card */}
              <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800 shadow-xs">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-24 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-sm border border-slate-700">
                    <img
                      src="/smvm-logo.png"
                      alt="Logótipo Oficial SMVM"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                      Identidade Visual Oficial (Sem Alterações)
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      Logótipo SMVM Original
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Fiel à imagem original fornecida: mantido exatamente sem modificações no emblema.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="/smvm-logo.png"
                    download="logotipo_smvm.png"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    Descarregar Imagem
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Razão Social / Nome da Instituição *
                  </label>
                  <input
                    type="text"
                    required
                    value={emitterForm.name}
                    onChange={(e) => setEmitterForm({ ...emitterForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIF / CNPJ / Número Fiscal *
                  </label>
                  <input
                    type="text"
                    required
                    value={emitterForm.taxId}
                    onChange={(e) => setEmitterForm({ ...emitterForm, taxId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    value={emitterForm.address}
                    onChange={(e) => setEmitterForm({ ...emitterForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cidade / UF
                  </label>
                  <input
                    type="text"
                    value={emitterForm.city}
                    onChange={(e) => setEmitterForm({ ...emitterForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail Institucional
                  </label>
                  <input
                    type="email"
                    value={emitterForm.email}
                    onChange={(e) => setEmitterForm({ ...emitterForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefone de Contato
                  </label>
                  <input
                    type="text"
                    value={emitterForm.phone}
                    onChange={(e) => setEmitterForm({ ...emitterForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    País
                  </label>
                  <input
                    type="text"
                    value={emitterForm.country}
                    onChange={(e) => setEmitterForm({ ...emitterForm, country: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Banco de Liquidação
                  </label>
                  <input
                    type="text"
                    value={emitterForm.bankName}
                    onChange={(e) => setEmitterForm({ ...emitterForm, bankName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    IBAN / Conta Bancária
                  </label>
                  <input
                    type="text"
                    value={emitterForm.ibanOrAccount}
                    onChange={(e) => setEmitterForm({ ...emitterForm, ibanOrAccount: e.target.value })}
                    placeholder="Ex: AO06 0040 0000 8953 6571 101 24"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Multicaixa Express / Titular
                  </label>
                  <input
                    type="text"
                    value={emitterForm.swiftOrPix || ''}
                    onChange={(e) => setEmitterForm({ ...emitterForm, swiftOrPix: e.target.value })}
                    placeholder="Ex: Express: 943004073 • Titular: Salomão Muanjita"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registo Notarial / Observação Legal de Rodapé
                </label>
                <input
                  type="text"
                  value={emitterForm.registrationNumber || ''}
                  onChange={(e) => setEmitterForm({ ...emitterForm, registrationNumber: e.target.value })}
                  placeholder="Ex: Registo PJ sob nº 88.291 / SMVM"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Salvar Dados do Emissor
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>SMVM • Emissão e Gestão de Facturas Certificadas</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
