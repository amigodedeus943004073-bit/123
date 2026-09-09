import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  PlusCircle,
  Clock,
  Sparkles,
  Wallet,
  FileText,
  Database,
  RefreshCw,
  Bell,
  ShieldCheck,
  Receipt,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface HeaderProps {
  totalBalance: number;
  onNewTransaction: () => void;
  onOpenAutomations: () => void;
  onOpenAccounts: () => void;
  onOpenReports: () => void;
  onOpenInvoices: () => void;
  onOpenBackup: () => void;
  onTriggerSync: () => void;
  alertCount: number;
  onOpenAlerts: () => void;
  pendingInvoicesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  totalBalance,
  onNewTransaction,
  onOpenAutomations,
  onOpenAccounts,
  onOpenReports,
  onOpenInvoices,
  onOpenBackup,
  onTriggerSync,
  alertCount,
  onOpenAlerts,
  pendingInvoicesCount = 0,
}) => {
  const [time, setTime] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualSync = () => {
    setIsSyncing(true);
    onTriggerSync();
    setTimeout(() => setIsSyncing(false), 600);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-4">
          {/* Brand & Live status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white flex items-center justify-center font-bold text-lg shadow-sm tracking-wider">
                SM
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                    SMVM Financeiro
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Ao Vivo
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Fluxo de Caixa Automatizado & Prestação de Contas
                </p>
              </div>
            </div>

            {/* Mobile balance & bell & invoices */}
            <div className="flex md:hidden items-center gap-1.5">
              <button
                id="btn-mobile-invoices"
                onClick={onOpenInvoices}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                title="Gestão de Facturas"
              >
                <Receipt className="w-5 h-5 text-emerald-600" />
                {pendingInvoicesCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {pendingInvoicesCount}
                  </span>
                )}
              </button>
              <button
                id="btn-mobile-alerts"
                onClick={onOpenAlerts}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                title="Alertas do Caixa"
              >
                <Bell className="w-5 h-5" />
                {alertCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {alertCount}
                  </span>
                )}
              </button>
              <button
                id="btn-mobile-new-tx"
                onClick={onNewTransaction}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <PlusCircle className="w-4 h-4" />
                Lançar
              </button>
            </div>
          </div>

          {/* Quick metrics & Real-time timestamp */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {time.toLocaleTimeString('pt-BR')} • {time.toLocaleDateString('pt-BR')}
              </span>
            </div>

            {/* Total Balance highlight pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-lg shadow-xs">
              <div className="text-[11px] text-slate-300 font-medium uppercase tracking-wider">
                Saldo Consolidado:
              </div>
              <div className="text-sm font-bold tracking-tight text-emerald-400">
                {formatCurrency(totalBalance)}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5">
              <button
                id="btn-open-invoices"
                onClick={onOpenInvoices}
                className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-blue-700 transition-colors shadow-xs"
                title="Emissão e Gestão de Facturas"
              >
                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Facturas</span>
                {pendingInvoicesCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full border border-amber-300">
                    {pendingInvoicesCount}
                  </span>
                )}
              </button>

              <button
                id="btn-open-reports"
                onClick={onOpenReports}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-blue-700 transition-colors shadow-xs"
                title="Demonstrativo de Fluxo de Caixa, DRE e Relatórios"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Relatórios & DFC</span>
              </button>

              <button
                id="btn-open-automations"
                onClick={onOpenAutomations}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-blue-700 transition-colors shadow-xs"
                title="Automações de recorrência e regras"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Automações</span>
              </button>

              <button
                id="btn-open-accounts"
                onClick={onOpenAccounts}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-blue-700 transition-colors shadow-xs"
                title="Bancos e Tesouraria"
              >
                <Wallet className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Contas</span>
              </button>

              <button
                id="btn-header-alerts"
                onClick={onOpenAlerts}
                className="relative hidden sm:inline-flex items-center p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                title="Alertas & Monitoramento de Caixa"
              >
                <Bell className="w-4 h-4" />
                {alertCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {alertCount}
                  </span>
                )}
              </button>

              <button
                id="btn-header-sync"
                onClick={handleManualSync}
                className={`p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors ${
                  isSyncing ? 'animate-spin text-blue-600' : ''
                }`}
                title="Recalcular Fluxo em Tempo Real"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                id="btn-header-backup"
                onClick={onOpenBackup}
                className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                title="Backup e Configurações"
              >
                <Database className="w-4 h-4" />
              </button>

              <button
                id="btn-header-new-transaction"
                onClick={onNewTransaction}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Nova Transação
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
