import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  Download,
  FileText,
  BarChart3,
  Calendar,
  Building,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  RotateCcw,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Transaction,
  Account,
  Category,
  CostCenter,
} from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { shareViaWhatsApp, formatFinancialReportWhatsApp } from '../utils/whatsapp';
import { getVerseOfTheDay, BIBLICAL_FINANCIAL_VERSES } from '../data/biblicalVerses';
import { SMVMLogo } from './SMVMLogo';

interface DetailedReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  costCenters: CostCenter[];
  totalBalance: number;
}

export const DetailedReportsModal: React.FC<DetailedReportsModalProps> = ({
  isOpen,
  onClose,
  transactions,
  accounts,
  categories,
  costCenters,
  totalBalance,
}) => {
  const [activeReport, setActiveReport] = useState<
    'periodic' | 'dfc' | 'categories' | 'cost_centers' | 'aging'
  >('periodic');
  const [periodGranularity, setPeriodGranularity] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [includeVerseInShare, setIncludeVerseInShare] = useState<boolean>(true);

  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => {
      const monthStr = t.date.substring(0, 7); // YYYY-MM
      set.add(monthStr);
    });
    return Array.from(set).sort().reverse();
  }, [transactions]);

  // Filtered transactions for the report
  const reportTx = useMemo(() => {
    if (selectedMonth === 'all') return transactions;
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Financial calculations
  const completedIncome = reportTx
    .filter((t) => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingIncome = reportTx
    .filter((t) => t.type === 'income' && t.status !== 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const completedExpense = reportTx
    .filter((t) => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingExpense = reportTx
    .filter((t) => t.type === 'expense' && t.status !== 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCompleted = completedIncome - completedExpense;
  const netTotalProjected = (completedIncome + pendingIncome) - (completedExpense + pendingExpense);

  // Group by category
  const categoryStats = useMemo(() => {
    return categories.map((cat) => {
      const catTx = reportTx.filter((t) => t.category === cat.id || t.category === cat.name);
      const realized = catTx
        .filter((t) => t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      const pending = catTx
        .filter((t) => t.status !== 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      const budget = cat.monthlyBudget || 0;
      const variance = budget > 0 ? realized - budget : 0;

      return {
        ...cat,
        realized,
        pending,
        total: realized + pending,
        variance,
      };
    });
  }, [categories, reportTx]);

  // Group by cost center
  const costCenterStats = useMemo(() => {
    return costCenters.map((cc) => {
      const ccTx = reportTx.filter((t) => t.costCenterId === cc.id);
      const income = ccTx
        .filter((t) => t.type === 'income' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = ccTx
        .filter((t) => t.type === 'expense' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        ...cc,
        income,
        expense,
        net: income - expense,
        txCount: ccTx.length,
      };
    });
  }, [costCenters, reportTx]);

  // Aging accounts (contas a pagar / receber pendentes)
  const pendingTransactions = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return transactions
      .filter((t) => t.status !== 'completed')
      .map((t) => {
        const dueDate = t.dueDate || t.date;
        let agingStatus: 'overdue' | 'today' | 'upcoming' = 'upcoming';
        if (dueDate < today) agingStatus = 'overdue';
        else if (dueDate === today) agingStatus = 'today';

        return {
          ...t,
          dueDate,
          agingStatus,
        };
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [transactions]);

  // PERIODIC REPORTS COMPUTATION (Diário, Semanal, Mensal, Anual)
  const periodicData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();

    if (periodGranularity === 'daily') {
      // Group by day of the selected month or current month
      const targetMonthStr = selectedMonth === 'all'
        ? `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`
        : selectedMonth;

      const [y, m] = targetMonthStr.split('-').map(Number);
      const daysInMonth = new Date(y, m, 0).getDate();
      const rows = [];
      let runningBalance = totalBalance;

      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = `${targetMonthStr}-${String(day).padStart(2, '0')}`;
        const dayLabel = `${String(day).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
        const dayTx = transactions.filter((t) => t.date.startsWith(dayStr));

        const income = dayTx
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);

        const expense = dayTx
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        const net = income - expense;
        runningBalance += net;

        rows.push({
          period: dayLabel,
          fullDate: dayStr,
          income,
          expense,
          net,
          runningBalance,
          count: dayTx.length,
        });
      }
      return rows;
    } else if (periodGranularity === 'weekly') {
      // Group by 5 weeks of the target month
      const targetMonthStr = selectedMonth === 'all'
        ? `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`
        : selectedMonth;

      const [y, m] = targetMonthStr.split('-').map(Number);
      const daysInMonth = new Date(y, m, 0).getDate();

      const weekDefs = [
        { start: 1, end: 7, label: `Semana 1 (01-07/${m})` },
        { start: 8, end: 14, label: `Semana 2 (08-14/${m})` },
        { start: 15, end: 21, label: `Semana 3 (15-21/${m})` },
        { start: 22, end: 28, label: `Semana 4 (22-28/${m})` },
        { start: 29, end: daysInMonth, label: `Semana 5 (29-${daysInMonth}/${m})` },
      ];

      return weekDefs.map((w) => {
        const startStr = `${targetMonthStr}-${String(w.start).padStart(2, '0')}`;
        const endStr = `${targetMonthStr}-${String(w.end).padStart(2, '0')}`;

        const weekTx = transactions.filter((t) => {
          const d = t.date.substring(0, 10);
          return d >= startStr && d <= endStr;
        });

        const income = weekTx
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);

        const expense = weekTx
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          period: w.label,
          fullDate: `${startStr} até ${endStr}`,
          income,
          expense,
          net: income - expense,
          count: weekTx.length,
        };
      });
    } else if (periodGranularity === 'monthly') {
      // 12 Months of the current year (or year of selectedMonth)
      const targetYear = selectedMonth !== 'all' ? selectedMonth.substring(0, 4) : String(currentYear);
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      return monthNames.map((name, idx) => {
        const mStr = `${targetYear}-${String(idx + 1).padStart(2, '0')}`;
        const mTx = transactions.filter((t) => t.date.startsWith(mStr));

        const income = mTx
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);

        const expense = mTx
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          period: `${name}/${targetYear.slice(2)}`,
          fullDate: mStr,
          income,
          expense,
          net: income - expense,
          count: mTx.length,
        };
      });
    } else {
      // Yearly comparison (2024, 2025, 2026, 2027)
      const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

      return years.map((yr) => {
        const yrPrefix = `${yr}-`;
        const yrTx = transactions.filter((t) => t.date.startsWith(yrPrefix));

        const income = yrTx
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);

        const expense = yrTx
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          period: `Ano ${yr}`,
          fullDate: `${yr}`,
          income,
          expense,
          net: income - expense,
          count: yrTx.length,
        };
      });
    }
  }, [periodGranularity, selectedMonth, transactions, totalBalance]);

  // Periodic totals
  const periodicTotalIncome = periodicData.reduce((sum, d) => sum + d.income, 0);
  const periodicTotalExpense = periodicData.reduce((sum, d) => sum + d.expense, 0);
  const periodicTotalNet = periodicTotalIncome - periodicTotalExpense;

  // Clear / Reset filters
  const handleClearFilters = () => {
    setSelectedMonth('all');
    setPeriodGranularity('daily');
  };

  // WhatsApp Share for current view
  const handleShareWhatsApp = () => {
    const periodMap = {
      daily: 'diario' as const,
      weekly: 'semanal' as const,
      monthly: 'mensal' as const,
      yearly: 'anual' as const,
    };

    const labelMap = {
      daily: `Relatório Diário (${selectedMonth === 'all' ? 'Mês Corrente' : selectedMonth})`,
      weekly: `Relatório Semanal (${selectedMonth === 'all' ? 'Mês Corrente' : selectedMonth})`,
      monthly: `Relatório Mensal Comparativo`,
      yearly: `Relatório Anual Consolidado`,
    };

    const text = formatFinancialReportWhatsApp({
      periodType: activeReport === 'periodic' ? periodMap[periodGranularity] : 'geral',
      periodLabel: activeReport === 'periodic' ? labelMap[periodGranularity] : (selectedMonth === 'all' ? 'Consolidado Geral' : selectedMonth),
      income: activeReport === 'periodic' ? periodicTotalIncome : completedIncome,
      expense: activeReport === 'periodic' ? periodicTotalExpense : completedExpense,
      net: activeReport === 'periodic' ? periodicTotalNet : netCompleted,
      accumulatedBalance: totalBalance,
      pendingCount: pendingTransactions.length,
      includeVerse: includeVerseInShare,
    });

    shareViaWhatsApp(text);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Data',
      'Vencimento',
      'Tipo',
      'Descricao',
      'Valor',
      'Status',
      'Forma_Pagamento',
      'Favorecido',
      'Conta_Origem',
      'Documento',
    ];

    const rows = reportTx.map((t) => {
      const acc = accounts.find((a) => a.id === t.accountId)?.name || '';
      return [
        `"${t.id}"`,
        `"${t.date}"`,
        `"${t.dueDate || t.date}"`,
        `"${t.type}"`,
        `"${t.description.replace(/"/g, '""')}"`,
        t.amount.toFixed(2),
        `"${t.status}"`,
        `"${t.paymentMethod}"`,
        `"${(t.entityOrRecipient || '').replace(/"/g, '""')}"`,
        `"${acc.replace(/"/g, '""')}"`,
        `"${(t.documentNumber || '').replace(/"/g, '""')}"`,
      ].join(';');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_financeiro_smvm_${selectedMonth || 'geral'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const verseOfTheDay = getVerseOfTheDay();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 no-print">
          <div className="flex items-center gap-3">
            <SMVMLogo size="md" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Relatórios Financeiros & Prestação de Contas SMVM
              </h2>
              <p className="text-xs text-slate-500">
                Relatórios Diários, Semanais, Mensais e Anuais com gráficos e exportação
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* WhatsApp Share Button */}
            <button
              id="btn-report-share-whatsapp"
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
              title="Compartilhar resumo e versículo no WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {/* Clear / Reset Filters */}
            <button
              id="btn-report-clear-filters"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors border border-slate-300"
              title="Limpar seleção e filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpar</span>
            </button>

            <button
              id="btn-report-export-csv"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-semibold transition-colors"
              title="Baixar planilha compatível com Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            <button
              id="btn-report-print"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
              title="Imprimir relatório formatado ou salvar como PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print Header (Visible ONLY on print) */}
        <div className="hidden print-only p-6 border-b border-slate-300">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">SMVM - GESTÃO FINANCEIRA</h1>
              <p className="text-sm text-slate-600">
                Demonstrativo de Fluxo de Caixa e Relatório Gerencial
              </p>
            </div>
            <div className="text-right text-xs text-slate-500 font-mono">
              <div>Emitido em: {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR')}</div>
              <div>Período: {selectedMonth === 'all' ? 'Consolidado Geral' : selectedMonth}</div>
            </div>
          </div>
        </div>

        {/* Tab selector and Period filter toolbar */}
        <div className="px-4 sm:px-5 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white no-print">
          <div className="flex flex-wrap gap-1">
            <button
              id="tab-report-periodic"
              onClick={() => setActiveReport('periodic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeReport === 'periodic'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Períodos (Diário/Semanal/Mensal/Anual)
            </button>

            <button
              id="tab-report-dfc"
              onClick={() => setActiveReport('dfc')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeReport === 'dfc'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Demonstrativo (DFC)
            </button>
            <button
              id="tab-report-categories"
              onClick={() => setActiveReport('categories')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeReport === 'categories'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Categorias
            </button>
            <button
              id="tab-report-cc"
              onClick={() => setActiveReport('cost_centers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeReport === 'cost_centers'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Centros de Custo
            </button>
            <button
              id="tab-report-aging"
              onClick={() => setActiveReport('aging')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                activeReport === 'aging'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Contas Pendentes
              {pendingTransactions.length > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {pendingTransactions.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Filtrar Mês:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todo o Período</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Body / Report Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Print-only official header */}
          <div className="hidden print-only pb-4 mb-4 border-b-2 border-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SMVMLogo size="lg" />
                <div>
                  <h1 className="text-lg font-black text-slate-900 tracking-tight">
                    SALOMÃO MUANJITA VINENE MOISES (SMVM)
                  </h1>
                  <p className="text-xs text-slate-600 font-semibold">
                    Relatório Financeiro & Prestação de Contas Oficial • NIF: 5002504642 • Cuito - Bié (Bairro Fátima), Angola
                  </p>
                </div>
              </div>
              <div className="text-right text-xs text-slate-500 font-mono">
                Emitido em: {formatDate(new Date().toISOString())}
              </div>
            </div>
          </div>
          {/* TAB 0: PERIODIC REPORTS (Diário, Semanal, Mensal, Anual) */}
          {activeReport === 'periodic' && (
            <div className="space-y-6">
              {/* Granularity Sub-filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-700 mr-1">Periodicidade:</span>
                  <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-medium">
                    <button
                      id="subtab-periodic-daily"
                      onClick={() => setPeriodGranularity('daily')}
                      className={`px-3 py-1 rounded-md transition-all ${
                        periodGranularity === 'daily'
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Diário (Dias)
                    </button>
                    <button
                      id="subtab-periodic-weekly"
                      onClick={() => setPeriodGranularity('weekly')}
                      className={`px-3 py-1 rounded-md transition-all ${
                        periodGranularity === 'weekly'
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Semanal (Semanas)
                    </button>
                    <button
                      id="subtab-periodic-monthly"
                      onClick={() => setPeriodGranularity('monthly')}
                      className={`px-3 py-1 rounded-md transition-all ${
                        periodGranularity === 'monthly'
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Mensal (Meses)
                    </button>
                    <button
                      id="subtab-periodic-yearly"
                      onClick={() => setPeriodGranularity('yearly')}
                      className={`px-3 py-1 rounded-md transition-all ${
                        periodGranularity === 'yearly'
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Anual (Anos)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShareWhatsApp}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Enviar este Relatório ao WhatsApp
                  </button>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-xs font-semibold text-emerald-800 uppercase">
                    Total de Entradas ({periodGranularity})
                  </div>
                  <div className="text-xl font-extrabold text-emerald-700 font-mono mt-1">
                    {formatCurrency(periodicTotalIncome)}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="text-xs font-semibold text-rose-800 uppercase">
                    Total de Saídas ({periodGranularity})
                  </div>
                  <div className="text-xl font-extrabold text-rose-700 font-mono mt-1">
                    {formatCurrency(periodicTotalExpense)}
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border ${
                    periodicTotalNet >= 0
                      ? 'bg-blue-50 border-blue-200 text-blue-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="text-xs font-semibold uppercase">
                    Resultado Líquido do Período
                  </div>
                  <div className="text-xl font-extrabold font-mono mt-1">
                    {formatCurrency(periodicTotalNet)}
                  </div>
                </div>
              </div>

              {/* Periodic Visual Chart */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    Gráfico Comparativo: Entradas vs Saídas ({periodGranularity.toUpperCase()})
                  </h4>
                  <span className="text-[11px] text-slate-400">Valores em R$</span>
                </div>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={periodicData}
                      margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="period"
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(val: any) => formatCurrency(Number(val))}
                        contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar name="Entradas" dataKey="income" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={28} />
                      <Bar name="Saídas" dataKey="expense" fill="#f43f5e" radius={[3, 3, 0, 0]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Periodic Detailed Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3">Período / Referência</th>
                      <th className="p-3 text-right">Entradas</th>
                      <th className="p-3 text-right">Saídas</th>
                      <th className="p-3 text-right">Resultado Líquido</th>
                      <th className="p-3 text-center">Transações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {periodicData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-800">
                          {row.period}
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-700 font-semibold">
                          {formatCurrency(row.income)}
                        </td>
                        <td className="p-3 text-right font-mono text-rose-700 font-semibold">
                          {formatCurrency(row.expense)}
                        </td>
                        <td className={`p-3 text-right font-mono font-bold ${row.net >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {formatCurrency(row.net)}
                        </td>
                        <td className="p-3 text-center font-mono text-slate-500">
                          {row.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-extrabold text-slate-900 border-t border-slate-300">
                      <td className="p-3">TOTAL CONSOLIDADO</td>
                      <td className="p-3 text-right font-mono text-emerald-700">
                        {formatCurrency(periodicTotalIncome)}
                      </td>
                      <td className="p-3 text-right font-mono text-rose-700">
                        {formatCurrency(periodicTotalExpense)}
                      </td>
                      <td className={`p-3 text-right font-mono ${periodicTotalNet >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {formatCurrency(periodicTotalNet)}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {periodicData.reduce((s, r) => s + r.count, 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 1: DFC / DRE */}
          {activeReport === 'dfc' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-xs font-semibold text-emerald-800 uppercase">
                    Receitas Realizadas
                  </div>
                  <div className="text-xl font-extrabold text-emerald-700 font-mono mt-1">
                    {formatCurrency(completedIncome)}
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-1">
                    + {formatCurrency(pendingIncome)} a receber
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="text-xs font-semibold text-rose-800 uppercase">
                    Despesas Realizadas
                  </div>
                  <div className="text-xl font-extrabold text-rose-700 font-mono mt-1">
                    {formatCurrency(completedExpense)}
                  </div>
                  <div className="text-[11px] text-rose-600 mt-1">
                    + {formatCurrency(pendingExpense)} a pagar
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border ${
                    netCompleted >= 0
                      ? 'bg-blue-50 border-blue-200 text-blue-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="text-xs font-semibold uppercase">
                    Superávit / Resultado Líquido
                  </div>
                  <div className="text-xl font-extrabold font-mono mt-1">
                    {formatCurrency(netCompleted)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Projetado consolidado: {formatCurrency(netTotalProjected)}
                  </div>
                </div>
              </div>

              {/* Structured DFC Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center font-bold text-xs text-slate-700">
                  <span>Estrutura do Demonstrativo Financeiro (DFC SMVM)</span>
                  <span>Valores Realizados</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {/* Receitas */}
                  <div className="p-3 bg-slate-50/50 font-bold text-emerald-700 flex justify-between items-center">
                    <span>1. ENTRADAS & RECEITAS OPERACIONAIS</span>
                    <span className="font-mono">{formatCurrency(completedIncome)}</span>
                  </div>
                  {categories
                    .filter((c) => c.type === 'income')
                    .map((cat) => {
                      const amount = reportTx
                        .filter(
                          (t) =>
                            (t.category === cat.id || t.category === cat.name) &&
                            t.status === 'completed'
                        )
                        .reduce((sum, t) => sum + t.amount, 0);
                      if (amount === 0) return null;
                      return (
                        <div
                          key={cat.id}
                          className="px-6 py-2 flex justify-between items-center text-slate-600 hover:bg-slate-50"
                        >
                          <span>1.{cat.name}</span>
                          <span className="font-mono font-medium">{formatCurrency(amount)}</span>
                        </div>
                      );
                    })}

                  {/* Despesas */}
                  <div className="p-3 bg-slate-50/50 font-bold text-rose-700 flex justify-between items-center">
                    <span>2. SAÍDAS & DESPESAS OPERACIONAIS</span>
                    <span className="font-mono">{formatCurrency(completedExpense)}</span>
                  </div>
                  {categories
                    .filter((c) => c.type === 'expense')
                    .map((cat) => {
                      const amount = reportTx
                        .filter(
                          (t) =>
                            (t.category === cat.id || t.category === cat.name) &&
                            t.status === 'completed'
                        )
                        .reduce((sum, t) => sum + t.amount, 0);
                      if (amount === 0) return null;
                      return (
                        <div
                          key={cat.id}
                          className="px-6 py-2 flex justify-between items-center text-slate-600 hover:bg-slate-50"
                        >
                          <span>2.{cat.name}</span>
                          <span className="font-mono font-medium">{formatCurrency(amount)}</span>
                        </div>
                      );
                    })}

                  {/* Resultado Operacional */}
                  <div className="p-4 bg-slate-100 font-extrabold text-slate-900 flex justify-between items-center text-sm border-t-2 border-slate-300">
                    <span>RESULTADO OPERACIONAL LÍQUIDO (SUPERÁVIT / DÉFICIT)</span>
                    <span
                      className={`font-mono text-base ${
                        netCompleted >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {formatCurrency(netCompleted)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Categories */}
          {activeReport === 'categories' && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="p-3">Categoria</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3 text-right">Realizado</th>
                    <th className="p-3 text-right">Pendente</th>
                    <th className="p-3 text-right">Teto Orçado</th>
                    <th className="p-3 text-right">Desvio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categoryStats.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-800 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        ></span>
                        {cat.name}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            cat.type === 'income'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {cat.type === 'income' ? 'Receita' : 'Despesa'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-slate-900">
                        {formatCurrency(cat.realized)}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-500">
                        {formatCurrency(cat.pending)}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-600">
                        {cat.monthlyBudget ? formatCurrency(cat.monthlyBudget) : '-'}
                      </td>
                      <td
                        className={`p-3 text-right font-mono font-semibold ${
                          cat.variance > 0
                            ? 'text-rose-600'
                            : cat.variance < 0
                            ? 'text-emerald-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {cat.monthlyBudget ? formatCurrency(cat.variance) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: Cost Centers */}
          {activeReport === 'cost_centers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {costCenterStats.map((cc) => (
                <div key={cc.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {cc.code}
                      </span>
                      <h3 className="font-bold text-slate-900 mt-1">{cc.name}</h3>
                      <p className="text-xs text-slate-500">{cc.manager}</p>
                    </div>
                    <span
                      className={`text-sm font-bold font-mono px-2.5 py-1 rounded-lg ${
                        cc.net >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {formatCurrency(cc.net)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block">Total Receitas:</span>
                      <span className="font-semibold text-emerald-600 font-mono">
                        {formatCurrency(cc.income)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Total Despesas:</span>
                      <span className="font-semibold text-rose-600 font-mono">
                        {formatCurrency(cc.expense)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: Aging / Contas a Pagar e Receber Pendentes */}
          {activeReport === 'aging' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  {pendingTransactions.length} contas pendentes identificadas no fluxo de caixa
                </span>
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-rose-600">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Vencidas
                  </span>
                  <span className="flex items-center gap-1 text-amber-600">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Vence Hoje
                  </span>
                  <span className="flex items-center gap-1 text-indigo-600">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span> A Vencer
                  </span>
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <th className="p-3">Vencimento</th>
                      <th className="p-3">Descrição / Favorecido</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Forma</th>
                      <th className="p-3">Prazo</th>
                      <th className="p-3 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400">
                          Nenhuma conta pendente no momento! Todos os lançamentos estão conciliados.
                        </td>
                      </tr>
                    ) : (
                      pendingTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-medium text-slate-700">
                            {formatDate(tx.dueDate)}
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-900">{tx.description}</div>
                            <div className="text-[11px] text-slate-400">
                              {tx.entityOrRecipient || 'Favorecido não informado'}
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                tx.type === 'income'
                                    ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {tx.type === 'income' ? 'A Receber' : 'A Pagar'}
                            </span>
                          </td>
                          <td className="p-3 uppercase text-[10px] font-bold text-slate-500">
                            {tx.paymentMethod}
                          </td>
                          <td className="p-3">
                            {tx.agingStatus === 'overdue' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                Vencido
                              </span>
                            ) : tx.agingStatus === 'today' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                                Vence Hoje
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                                No Prazo
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(tx.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Devotional Footer Card inside report */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-indigo-900">Princípio Bíblico de Mordomia:</span>{' '}
              <span className="text-slate-700 italic">"{verseOfTheDay.text}"</span> —{' '}
              <span className="font-semibold text-indigo-700">{verseOfTheDay.reference}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 no-print">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium select-none">
              <input
                type="checkbox"
                checked={includeVerseInShare}
                onChange={(e) => setIncludeVerseInShare(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Incluir versículo bíblico no WhatsApp</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearFilters}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors border border-slate-300"
            >
              Limpar Filtros
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors"
            >
              Fechar Relatório
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
