import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Activity, MessageCircle, TrendingUp, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { CashFlowPeriodData } from '../types/finance';
import { shareViaWhatsApp, formatFinancialReportWhatsApp } from '../utils/whatsapp';

interface CashFlowChartProps {
  dailyData: CashFlowPeriodData[];
  weeklyData?: CashFlowPeriodData[];
  monthlyData: CashFlowPeriodData[];
  yearlyData?: CashFlowPeriodData[];
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({
  dailyData,
  weeklyData = [],
  monthlyData,
  yearlyData = [],
}) => {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [chartType, setChartType] = useState<'flow' | 'accumulated'>('flow');

  const getActiveData = () => {
    switch (viewMode) {
      case 'weekly':
        return weeklyData.length ? weeklyData : dailyData;
      case 'monthly':
        return monthlyData;
      case 'yearly':
        return yearlyData.length ? yearlyData : monthlyData;
      case 'daily':
      default:
        return dailyData;
    }
  };

  const activeData = getActiveData();

  // Calculate high-level stats for the active chart
  const totalIncome = activeData.reduce((sum, d) => sum + d.income, 0);
  const totalExpense = activeData.reduce((sum, d) => sum + d.expense, 0);
  const totalNet = totalIncome - totalExpense;
  const maxIncome = Math.max(...activeData.map((d) => d.income), 0);
  const maxExpense = Math.max(...activeData.map((d) => d.expense), 0);
  const averageBalance =
    activeData.reduce((sum, d) => sum + d.accumulatedBalance, 0) /
    (activeData.length || 1);

  const handleShareWhatsApp = () => {
    const periodMap = {
      daily: 'diario' as const,
      weekly: 'semanal' as const,
      monthly: 'mensal' as const,
      yearly: 'anual' as const,
    };

    const labelMap = {
      daily: 'Movimentação Diária (Mês Corrente)',
      weekly: 'Visão Semanal Consolidada',
      monthly: 'Visão Mensal (Histórico e Projeção)',
      yearly: 'Comparativo Financeiro Anual',
    };

    const text = formatFinancialReportWhatsApp({
      periodType: periodMap[viewMode],
      periodLabel: labelMap[viewMode],
      income: totalIncome,
      expense: totalExpense,
      net: totalNet,
      accumulatedBalance: activeData[activeData.length - 1]?.accumulatedBalance,
      includeVerse: true,
    });

    shareViaWhatsApp(text);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as CashFlowPeriodData;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs min-w-[190px]">
          <div className="font-bold border-b border-slate-700 pb-1 mb-2 flex items-center justify-between">
            <span>{dataPoint.label}</span>
            {dataPoint.isProjection && (
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded">
                Projetado
              </span>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-emerald-400">
              <span>Entradas:</span>
              <span className="font-semibold font-mono">
                {formatCurrency(dataPoint.income)}
              </span>
            </div>
            <div className="flex justify-between items-center text-rose-400">
              <span>Saídas:</span>
              <span className="font-semibold font-mono">
                {formatCurrency(dataPoint.expense)}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300 pt-1 border-t border-slate-800">
              <span>Resultado:</span>
              <span
                className={`font-semibold font-mono ${
                  dataPoint.net >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCurrency(dataPoint.net)}
              </span>
            </div>
            <div className="flex justify-between items-center text-blue-300 pt-1 border-t border-slate-800">
              <span>Saldo Acumulado:</span>
              <span className="font-bold font-mono">
                {formatCurrency(dataPoint.accumulatedBalance)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
      {/* Header controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Monitoramento do Fluxo de Caixa
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {viewMode === 'daily' && 'Movimentação diária do mês corrente com projeções automatizadas'}
            {viewMode === 'weekly' && 'Agrupamento e evolução por semanas com médias de movimentação'}
            {viewMode === 'monthly' && 'Visão histórica consolidada mês a mês e estimativa futura'}
            {viewMode === 'yearly' && 'Consolidado e comparativo multianual de receitas e despesas'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 4 Period Granularity Buttons */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-medium">
            <button
              id="btn-chart-daily"
              onClick={() => setViewMode('daily')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'daily'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Diário
            </button>
            <button
              id="btn-chart-weekly"
              onClick={() => setViewMode('weekly')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'weekly'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semanal
            </button>
            <button
              id="btn-chart-monthly"
              onClick={() => setViewMode('monthly')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'monthly'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mensal
            </button>
            <button
              id="btn-chart-yearly"
              onClick={() => setViewMode('yearly')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'yearly'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Anual
            </button>
          </div>

          {/* View type selector */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-medium">
            <button
              id="btn-chart-flow"
              onClick={() => setChartType('flow')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                chartType === 'flow'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fluxo
            </button>
            <button
              id="btn-chart-accumulated"
              onClick={() => setChartType('accumulated')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                chartType === 'accumulated'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Acumulado
            </button>
          </div>

          {/* WhatsApp share button */}
          <button
            id="btn-chart-share-whatsapp"
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-semibold transition-colors shadow-xs"
            title="Compartilhar este resumo no WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'flow' ? (
            <ComposedChart
              data={activeData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 8, fontSize: '11px' }}
              />
              <Bar
                name="Entradas"
                dataKey="income"
                fill="#10b981"
                radius={[3, 3, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                name="Saídas"
                dataKey="expense"
                fill="#f43f5e"
                radius={[3, 3, 0, 0]}
                maxBarSize={32}
              />
              <Area
                type="monotone"
                name="Saldo Acumulado"
                dataKey="accumulatedBalance"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={0.08}
                fill="#3b82f6"
              />
            </ComposedChart>
          ) : (
            <ComposedChart
              data={activeData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                name="Saldo Acumulado"
                dataKey="accumulatedBalance"
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#balanceGrad)"
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Highlights footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">Total Entradas</span>
          <span className="font-bold text-emerald-600 font-mono">
            {formatCurrency(totalIncome)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Total Saídas</span>
          <span className="font-bold text-rose-600 font-mono">
            {formatCurrency(totalExpense)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Resultado Líquido</span>
          <span className={`font-bold font-mono ${totalNet >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(totalNet)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Saldo Médio</span>
          <span className="font-bold text-blue-600 font-mono">
            {formatCurrency(averageBalance)}
          </span>
        </div>
      </div>
    </div>
  );
};
