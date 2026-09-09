import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  CheckCircle,
  Clock,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  Plus,
  FileSpreadsheet,
  CheckCheck,
  MessageCircle,
  RotateCcw,
  CheckCircle2,
  Layers,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Eye,
} from 'lucide-react';
import { Transaction, Account, Category, CostCenter } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { shareViaWhatsApp, formatFinancialReportWhatsApp } from '../utils/whatsapp';
import { ClearTransactionsModal } from './ClearTransactionsModal';
import { ConfirmModal } from './ConfirmModal';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  costCenters: CostCenter[];
  onNewTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onDuplicateTransaction: (tx: Transaction) => void;
  onToggleStatus: (tx: Transaction) => void;
  onClearAllTransactions?: (zeroAccountBalances?: boolean) => void;
  onRestoreDemoTransactions?: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  accounts,
  categories,
  costCenters,
  onNewTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onDuplicateTransaction,
  onToggleStatus,
  onClearAllTransactions,
  onRestoreDemoTransactions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'scheduled'>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<'month' | '7days' | 'future' | 'all'>('all');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);
  const [expandAll, setExpandAll] = useState(false);
  const [expandedTxIds, setExpandedTxIds] = useState<Set<string>>(new Set());

  const toggleExpandRow = (id: string) => {
    setExpandedTxIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleOpenAll = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setStatusFilter('all');
    setAccountFilter('all');
    setPeriodFilter('all');
    setExpandAll(true);
  };

  const handleToggleExpandAll = () => {
    setExpandAll((prev) => !prev);
  };

  // Account & Category lookups
  const accountMap = useMemo(() => {
    const map = new Map<string, Account>();
    accounts.forEach((a) => map.set(a.id, a));
    return map;
  }, [accounts]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const costCenterMap = useMemo(() => {
    const map = new Map<string, CostCenter>();
    costCenters.forEach((cc) => map.set(cc.id, cc));
    return map;
  }, [costCenters]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    const today = new Date();
    const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    return transactions
      .filter((tx) => {
        // Search term
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const descMatch = tx.description.toLowerCase().includes(term);
          const entityMatch = tx.entityOrRecipient?.toLowerCase().includes(term);
          const docMatch = tx.documentNumber?.toLowerCase().includes(term);
          if (!descMatch && !entityMatch && !docMatch) return false;
        }

        // Type filter
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

        // Status filter
        if (statusFilter !== 'all' && tx.status !== statusFilter) return false;

        // Account filter
        if (accountFilter !== 'all' && tx.accountId !== accountFilter && tx.toAccountId !== accountFilter) {
          return false;
        }

        // Period filter
        if (periodFilter === 'month') {
          return tx.date.startsWith(currentYearMonth);
        } else if (periodFilter === '7days') {
          const txDate = new Date(tx.date);
          const diffDays = Math.abs((today.getTime() - txDate.getTime()) / (1000 * 3600 * 24));
          return diffDays <= 7;
        } else if (periodFilter === 'future') {
          return new Date(tx.date) >= today || tx.status === 'pending' || tx.status === 'scheduled';
        }

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, typeFilter, statusFilter, accountFilter, periodFilter]);

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    typeFilter !== 'all' ||
    statusFilter !== 'all' ||
    accountFilter !== 'all' ||
    periodFilter !== 'month';

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setStatusFilter('all');
    setAccountFilter('all');
    setPeriodFilter('month');
  };

  const handleShareListWhatsApp = () => {
    const totalInc = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const totalExp = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const net = totalInc - totalExp;

    const periodLabels: Record<string, string> = {
      month: 'Lançamentos Deste Mês',
      '7days': 'Últimos 7 Dias',
      future: 'Contas Pendentes & Agendadas',
      all: 'Extrato Geral Completo',
    };

    const text = formatFinancialReportWhatsApp({
      periodType: 'geral',
      periodLabel: `${periodLabels[periodFilter] || 'Extrato'} (${filteredTransactions.length} registros)`,
      income: totalInc,
      expense: totalExp,
      net,
      includeVerse: true,
    });

    shareViaWhatsApp(text);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Header with title and Limpar/Zerar action */}
      <div className="px-5 py-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-100 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Lançamentos & Fluxo de Caixa
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {transactions.length} {transactions.length === 1 ? 'registro' : 'registros'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Controle detalhado de entradas, saídas e transferências da SMVM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Botão Abrir Tudo (Exibir todo o histórico e expandir) */}
          <button
            id="btn-list-open-all"
            type="button"
            onClick={handleOpenAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 border border-indigo-200 rounded-xl transition-all shadow-xs"
            title="Abrir todo o histórico, limpar filtros e exibir todos os detalhes"
          >
            <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Abrir Tudo</span>
          </button>

          {/* Toggle Expandir / Recolher Detalhes */}
          {transactions.length > 0 && (
            <button
              id="btn-list-toggle-expand"
              type="button"
              onClick={handleToggleExpandAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all shadow-xs"
              title={expandAll ? 'Recolher detalhes das linhas' : 'Expandir detalhes de todas as linhas'}
            >
              {expandAll ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Recolher</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>Expandir</span>
                </>
              )}
            </button>
          )}

          {/* Botão de Limpar e Zerar Lançamentos */}
          {transactions.length > 0 && onClearAllTransactions && (
            <button
              id="btn-list-clear-all"
              type="button"
              onClick={() => setIsClearModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-300 rounded-xl transition-all shadow-xs"
              title="Limpar e zerar todos os lançamentos cadastrados"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Limpar e Zerar Lançamentos</span>
            </button>
          )}

          {/* Botão Restaurar Demonstração quando lista vazia */}
          {transactions.length === 0 && onRestoreDemoTransactions && (
            <button
              id="btn-list-restore-demo"
              type="button"
              onClick={onRestoreDemoTransactions}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all shadow-xs"
              title="Restaurar dados de demonstração da SMVM"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Restaurar Demonstração</span>
            </button>
          )}

          <button
            id="btn-list-new-tx"
            type="button"
            onClick={onNewTransaction}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* Search and filter controls toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-tx-search"
              type="text"
              placeholder="Buscar por descrição, favorecido, nota fiscal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Period select */}
            <select
              id="select-tx-period"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="month">Este Mês</option>
              <option value="7days">Últimos 7 Dias</option>
              <option value="future">Pendentes & Agendados</option>
              <option value="all">Todo o Histórico</option>
            </select>

            {/* Account select */}
            <select
              id="select-tx-account"
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 max-w-[180px] truncate"
            >
              <option value="all">Todas as Contas</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>

            <button
              id="btn-list-new-tx"
              onClick={onNewTransaction}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo
            </button>
          </div>
        </div>

        {/* Badges filter row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Type filters */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                typeFilter === 'all'
                  ? 'bg-slate-900 text-white font-medium shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({transactions.length})
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                typeFilter === 'income'
                  ? 'bg-emerald-600 text-white font-medium shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Receitas
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                typeFilter === 'expense'
                  ? 'bg-rose-600 text-white font-medium shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Despesas
            </button>
            <button
              onClick={() => setTypeFilter('transfer')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                typeFilter === 'transfer'
                  ? 'bg-blue-600 text-white font-medium shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Transferências
            </button>
          </div>

          {/* Status filters */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md ${
                statusFilter === 'all' ? 'bg-slate-200 text-slate-800 font-semibold' : 'text-slate-600'
              }`}
            >
              Status: Todos
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 ${
                statusFilter === 'completed'
                  ? 'bg-emerald-100 text-emerald-800 font-semibold'
                  : 'text-slate-600'
              }`}
            >
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              Realizados
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 ${
                statusFilter === 'pending'
                  ? 'bg-amber-100 text-amber-800 font-semibold'
                  : 'text-slate-600'
              }`}
            >
              <Clock className="w-3 h-3 text-amber-600" />
              Pendentes
            </button>
          </div>

          {/* Quick Actions: Limpar Filtros & WhatsApp */}
          <div className="flex items-center gap-1.5 ml-auto">
            {hasActiveFilters && (
              <button
                id="btn-list-clear-filters"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors shadow-xs"
                title="Redefinir campos de pesquisa e filtros"
              >
                <RotateCcw className="w-3 h-3 text-slate-500" />
                <span>Redefinir Busca</span>
              </button>
            )}

            <button
              id="btn-list-share-whatsapp"
              onClick={handleShareListWhatsApp}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors shadow-xs"
              title="Compartilhar extrato no WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
              <th className="py-3 px-4">Data</th>
              <th className="py-3 px-4">Descrição & Favorecido</th>
              <th className="py-3 px-4">Categoria / C. Custo</th>
              <th className="py-3 px-4">Conta Bancária</th>
              <th className="py-3 px-4">Forma</th>
              <th className="py-3 px-4 text-center">Status / Baixa</th>
              <th className="py-3 px-4 text-right">Valor (Kz)</th>
              <th className="py-3 px-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-14 text-center">
                  <div className="flex flex-col items-center justify-center max-w-md mx-auto p-6 bg-slate-50/80 border border-slate-200 rounded-2xl">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 shadow-xs">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mb-1">
                      Caixa Limpo e Zerado
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4 text-center">
                      Todos os lançamentos foram removidos. O sistema está pronto para você registrar as movimentações reais da SMVM.
                    </p>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={onNewTransaction}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Novo Lançamento</span>
                      </button>
                      {onRestoreDemoTransactions && (
                        <button
                          type="button"
                          onClick={onRestoreDemoTransactions}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-xs transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                          <span>Restaurar Demonstração</span>
                        </button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Filter className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-500">
                      Nenhuma transação encontrada com os filtros selecionados
                    </p>
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="text-blue-600 hover:underline text-xs font-semibold mt-1 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Redefinir filtros de busca
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const account = accountMap.get(tx.accountId);
                const toAccount = tx.toAccountId ? accountMap.get(tx.toAccountId) : undefined;
                const category = categoryMap.get(tx.category) || {
                  name: tx.category,
                  color: '#64748b',
                };
                const costCenter = tx.costCenterId ? costCenterMap.get(tx.costCenterId) : undefined;
                const isExpanded = expandAll || expandedTxIds.has(tx.id);

                return (
                  <React.Fragment key={tx.id}>
                    <tr
                      className={`transition-colors group ${
                        isExpanded ? 'bg-indigo-50/20' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Date with Expand Toggle */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-mono">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleExpandRow(tx.id)}
                            className="p-1 -ml-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title={isExpanded ? 'Recolher detalhes' : 'Abrir detalhes deste lançamento'}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-indigo-600" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>
                          <span>{formatDate(tx.date)}</span>
                        </div>
                      </td>

                    {/* Description & Entity */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${
                            tx.type === 'income'
                              ? 'bg-emerald-50 text-emerald-600'
                              : tx.type === 'expense'
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-blue-50 text-blue-600'
                          }`}
                        >
                          {tx.type === 'income' ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : tx.type === 'expense' ? (
                            <ArrowDownRight className="w-4 h-4" />
                          ) : (
                            <ArrowLeftRight className="w-4 h-4" />
                          )}
                        </div>
                        <div className="truncate max-w-xs sm:max-w-sm">
                          <div className="font-semibold text-slate-900 truncate">
                            {tx.description}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                            {tx.entityOrRecipient && (
                              <span>{tx.entityOrRecipient}</span>
                            )}
                            {tx.documentNumber && (
                              <span className="font-mono text-slate-400">
                                • {tx.documentNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category & Cost Center */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: category.color }}
                        ></span>
                        <span className="text-slate-800 truncate max-w-[140px]">
                          {category.name}
                        </span>
                      </div>
                      {costCenter && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          {costCenter.code} - {costCenter.name}
                        </div>
                      )}
                    </td>

                    {/* Account */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      <div className="truncate max-w-[140px] font-medium text-slate-800">
                        {account ? account.name : 'Conta Padrão'}
                      </div>
                      {tx.type === 'transfer' && toAccount && (
                        <div className="text-[10px] text-blue-600 font-medium">
                          ➜ {toAccount.name}
                        </div>
                      )}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {tx.paymentMethod}
                      </span>
                    </td>

                    {/* Status & 1-Click Action */}
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => onToggleStatus(tx)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                          tx.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : tx.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 animate-pulse'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                        }`}
                        title="Clique para alternar entre Realizado e Pendente"
                      >
                        {tx.status === 'completed' ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            Realizado
                          </>
                        ) : tx.status === 'pending' ? (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pendente (Baixar)
                          </>
                        ) : (
                          <>
                            <Calendar className="w-3 h-3 text-indigo-600" />
                            Agendado
                          </>
                        )}
                      </button>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold">
                      <span
                        className={
                          tx.type === 'income'
                            ? 'text-emerald-600'
                            : tx.type === 'expense'
                            ? 'text-rose-600'
                            : 'text-blue-600'
                        }
                      >
                        {tx.type === 'income' ? '+ ' : tx.type === 'expense' ? '- ' : ''}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                          title="Editar lançamento"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDuplicateTransaction(tx)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                          title="Duplicar lançamento"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTxToDelete(tx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Excluir lançamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Detalhes Expandidos da Linha */}
                  {isExpanded && (
                    <tr className="bg-slate-50/70 border-b border-slate-200">
                      <td colSpan={8} className="py-3 px-4 sm:px-6">
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Dados do Lançamento
                            </span>
                            <div className="space-y-1 text-slate-700">
                              <div><strong className="text-slate-900">ID:</strong> <span className="font-mono text-slate-500 text-[11px]">{tx.id}</span></div>
                              <div><strong className="text-slate-900">Favorecido/Pagador:</strong> {tx.entityOrRecipient || '—'}</div>
                              <div><strong className="text-slate-900">Documento / NF:</strong> {tx.documentNumber || '—'}</div>
                              {tx.dueDate && <div><strong className="text-slate-900">Vencimento:</strong> <span className="font-mono">{formatDate(tx.dueDate)}</span></div>}
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Detalhes Financeiros
                            </span>
                            <div className="space-y-1 text-slate-700">
                              <div><strong className="text-slate-900">Conta:</strong> {account ? account.name : 'Conta Padrão'}</div>
                              {toAccount && <div><strong className="text-slate-900">Conta Destino:</strong> {toAccount.name}</div>}
                              <div><strong className="text-slate-900">Centro de Custo:</strong> {costCenter ? `${costCenter.code} - ${costCenter.name}` : 'Geral da SMVM'}</div>
                              <div><strong className="text-slate-900">Forma de Liquidação:</strong> <span className="uppercase font-semibold">{tx.paymentMethod}</span></div>
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Observações & Notas
                            </span>
                            <p className="text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs">
                              {tx.notes || 'Nenhuma observação cadastrada para este lançamento.'}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                tx.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : tx.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                {tx.status === 'completed' ? 'Efetivado / Baixado' : tx.status === 'pending' ? 'Pendente' : 'Agendado'}
                              </span>
                              <button
                                type="button"
                                onClick={() => onEditTransaction(tx)}
                                className="text-blue-600 hover:underline text-xs font-semibold flex items-center gap-1"
                              >
                                <Edit2 className="w-3 h-3" />
                                Editar
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
        <span>
          Mostrando <strong>{filteredTransactions.length}</strong> de <strong>{transactions.length}</strong> lançamentos
        </span>
        <span className="font-mono">SMVM • Sistema Financeiro Ativo</span>
      </div>

      {/* Single transaction delete confirmation modal */}
      {txToDelete && (
        <ConfirmModal
          isOpen={Boolean(txToDelete)}
          title="Excluir Lançamento"
          message={`Tem certeza que deseja excluir o lançamento "${txToDelete.description}" no valor de ${formatCurrency(txToDelete.amount)}?`}
          confirmText="Sim, Excluir"
          cancelText="Cancelar"
          variant="danger"
          onConfirm={() => {
            onDeleteTransaction(txToDelete.id);
            setTxToDelete(null);
          }}
          onCancel={() => setTxToDelete(null)}
        />
      )}

      {/* Clear all transactions modal */}
      {isClearModalOpen && onClearAllTransactions && (
        <ClearTransactionsModal
          isOpen={isClearModalOpen}
          transactionsCount={transactions.length}
          onClose={() => setIsClearModalOpen(false)}
          onConfirmClear={(zeroBalances) => {
            onClearAllTransactions(zeroBalances);
            setIsClearModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
