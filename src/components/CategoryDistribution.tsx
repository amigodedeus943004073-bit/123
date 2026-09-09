import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { PieChart as PieIcon, Layers, AlertTriangle } from 'lucide-react';
import { Category, Transaction, CostCenter } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface CategoryDistributionProps {
  categories: Category[];
  transactions: Transaction[];
  costCenters: CostCenter[];
}

export const CategoryDistribution: React.FC<CategoryDistributionProps> = ({
  categories,
  transactions,
  costCenters,
}) => {
  const [activeTab, setActiveTab] = useState<'expense' | 'income' | 'cost_centers'>('expense');

  // Filter transactions for current period (or completed ones)
  const relevantTx = transactions.filter((t) => t.status === 'completed');

  // Calculate expense category totals
  const categoryTotals = categories
    .filter((cat) => cat.type === (activeTab === 'income' ? 'income' : 'expense'))
    .map((cat) => {
      const total = relevantTx
        .filter((tx) => tx.category === cat.id || tx.category === cat.name)
        .reduce((sum, tx) => sum + tx.amount, 0);

      const budget = cat.monthlyBudget || 0;
      const budgetPercent = budget > 0 ? (total / budget) * 100 : 0;

      return {
        id: cat.id,
        name: cat.name,
        value: total,
        color: cat.color,
        budget,
        budgetPercent,
      };
    })
    .filter((item) => item.value > 0 || item.budget > 0)
    .sort((a, b) => b.value - a.value);

  // Cost Center totals
  const costCenterTotals = costCenters.map((cc) => {
    const totalExpenses = relevantTx
      .filter((tx) => tx.costCenterId === cc.id && tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalIncome = relevantTx
      .filter((tx) => tx.costCenterId === cc.id && tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      id: cc.id,
      name: cc.name,
      code: cc.code,
      totalExpenses,
      totalIncome,
      net: totalIncome - totalExpenses,
    };
  });

  const totalSum = categoryTotals.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalSum > 0 ? ((data.value / totalSum) * 100).toFixed(1) : '0';
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-lg text-xs">
          <div className="font-semibold text-slate-200">{data.name}</div>
          <div className="text-emerald-400 font-mono font-bold mt-1">
            {formatCurrency(data.value)} ({percentage}%)
          </div>
          {data.budget > 0 && (
            <div className="text-slate-400 text-[11px] mt-0.5">
              Orçamento: {formatCurrency(data.budget)} ({data.budgetPercent.toFixed(0)}%)
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Distribuição & Orçamentos
            </h2>
          </div>

          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-medium">
            <button
              id="btn-cat-expense"
              onClick={() => setActiveTab('expense')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Despesas
            </button>
            <button
              id="btn-cat-income"
              onClick={() => setActiveTab('income')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'income'
                  ? 'bg-white text-emerald-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Receitas
            </button>
            <button
              id="btn-cat-cc"
              onClick={() => setActiveTab('cost_centers')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'cost_centers'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Centros de Custo
            </button>
          </div>
        </div>

        {activeTab !== 'cost_centers' ? (
          <div>
            {/* Donut chart */}
            <div className="h-44 w-full relative flex items-center justify-center">
              {categoryTotals.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                      data={categoryTotals}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={68}
                      paddingAngle={2}
                    >
                      {categoryTotals.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-400">Sem lançamentos no período</p>
              )}
              {/* Centered label inside donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Total {activeTab === 'expense' ? 'Despesas' : 'Receitas'}
                </span>
                <span className="text-xs font-extrabold text-slate-800 font-mono">
                  {formatCurrency(totalSum)}
                </span>
              </div>
            </div>

            {/* Category breakdown with progress bars */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 text-xs mt-2">
              {categoryTotals.slice(0, 5).map((cat) => {
                const isOverBudget = cat.budget > 0 && cat.value > cat.budget;
                return (
                  <div key={cat.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        ></span>
                        <span className="font-medium text-slate-700 truncate">
                          {cat.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isOverBudget && (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" title="Limite orçamentário superado" />
                        )}
                        <span className="font-semibold text-slate-900 font-mono">
                          {formatCurrency(cat.value)}
                        </span>
                      </div>
                    </div>

                    {cat.budget > 0 && (
                      <div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(cat.budgetPercent, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                          <span>Orçado: {formatCurrency(cat.budget)}</span>
                          <span className={isOverBudget ? 'text-rose-600 font-semibold' : ''}>
                            {cat.budgetPercent.toFixed(0)}% utilizado
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Centros de Custo */
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 text-xs">
            {costCenterTotals.map((cc) => (
              <div key={cc.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded mr-1.5">
                      {cc.code}
                    </span>
                    <span className="font-semibold text-slate-800">{cc.name}</span>
                  </div>
                  <span
                    className={`font-mono font-bold ${
                      cc.net >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {formatCurrency(cc.net)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 mt-2 pt-1.5 border-t border-slate-200">
                  <div>
                    <span>Receitas: </span>
                    <strong className="text-emerald-600 font-mono">
                      {formatCurrency(cc.totalIncome)}
                    </strong>
                  </div>
                  <div>
                    <span>Despesas: </span>
                    <strong className="text-rose-600 font-mono">
                      {formatCurrency(cc.totalExpenses)}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
