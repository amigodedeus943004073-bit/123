import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/formatters';

interface MetricsOverviewProps {
  totalBalance: number;
  completedIncome: number;
  pendingIncome: number;
  completedExpense: number;
  pendingExpense: number;
  netResult: number;
  projectedBalance30Days: number;
  activeAccountsCount: number;
  reserveAmount: number;
  monthName: string;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  totalBalance,
  completedIncome,
  pendingIncome,
  completedExpense,
  pendingExpense,
  netResult,
  projectedBalance30Days,
  activeAccountsCount,
  reserveAmount,
  monthName,
}) => {
  const totalMonthExpectedIncome = completedIncome + pendingIncome;
  const totalMonthExpectedExpense = completedExpense + pendingExpense;
  const projectedMonthNet = totalMonthExpectedIncome - totalMonthExpectedExpense;

  // Monthly burn rate based on expenses
  const dailyBurn = totalMonthExpectedExpense > 0 ? totalMonthExpectedExpense / 30 : 1;
  const runwayDays = Math.max(0, Math.floor(totalBalance / dailyBurn));
  const runwayMonths = (runwayDays / 30).toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Saldo Consolidado */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Saldo Disponível
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {formatCurrency(totalBalance)}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {activeAccountsCount} contas ativas
          </span>
          <span className="text-slate-400 font-mono text-[11px]" title="Reserva de Contingência">
            Reserva: {formatCurrency(reserveAmount)}
          </span>
        </div>
      </div>

      {/* 2. Entradas do Mês */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Entradas • {monthName}
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-emerald-600 tracking-tight">
          {formatCurrency(completedIncome)}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 text-slate-600 font-medium">
            <Clock className="w-3 h-3 text-amber-500" />
            A receber:
          </span>
          <span className="font-semibold text-slate-700">
            {formatCurrency(pendingIncome)}
          </span>
        </div>
      </div>

      {/* 3. Saídas do Mês */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Saídas • {monthName}
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-rose-600 tracking-tight">
          {formatCurrency(completedExpense)}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 text-slate-600 font-medium">
            <Clock className="w-3 h-3 text-amber-500" />
            A pagar:
          </span>
          <span className="font-semibold text-slate-700">
            {formatCurrency(pendingExpense)}
          </span>
        </div>
      </div>

      {/* 4. Superávit Operacional & Previsão 30 Dias */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Resultado Líquido
          </span>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              netResult >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            {netResult >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
          </div>
        </div>
        <div
          className={`text-2xl font-extrabold tracking-tight ${
            netResult >= 0 ? 'text-indigo-600' : 'text-amber-600'
          }`}
        >
          {formatCurrency(netResult)}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="text-slate-600 font-medium">Previsto 30d:</span>
          <span
            className={`font-semibold ${
              projectedBalance30Days >= totalBalance ? 'text-emerald-600' : 'text-slate-700'
            }`}
            title="Saldo consolidado projetado para os próximos 30 dias"
          >
            {formatCurrency(projectedBalance30Days)}
          </span>
        </div>
      </div>
    </div>
  );
};
