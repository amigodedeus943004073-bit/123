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
  Receipt,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  Landmark,
  Copy,
  Check,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { SMVMLogo } from './SMVMLogo';

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
  onZeroAll?: () => void;
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
  onZeroAll,
}) => {
  const [time, setTime] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isZeroModalOpen, setIsZeroModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualSync = () => {
    setIsSyncing(true);
    onTriggerSync();
    setTimeout(() => setIsSyncing(false), 600);
  };

  const handleConfirmZero = () => {
    if (onZeroAll) {
      onZeroAll();
    }
    setIsZeroModalOpen(false);
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        {/* Top subtle brand hairline accent */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400"></div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3 gap-3.5">
            {/* Left section: Official Logo & Corporate Identification */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Logo with elevated container */}
                <div
                  className="p-1.5 bg-gradient-to-b from-blue-50/90 via-white to-slate-50/90 rounded-2xl border border-blue-200/80 shadow-xs ring-1 ring-blue-500/10 flex items-center justify-center shrink-0 transition-transform hover:scale-102"
                  title="Salomão Muanjita Vinene Moises (SMVM) - Bié, Angola"
                >
                  <SMVMLogo size="md" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                      <span>SMVM</span>
                      <span className="text-blue-600 font-extrabold">Financeiro</span>
                    </h1>

                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 gap-1 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Ao Vivo
                    </span>

                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/70">
                      Cuito • Bié
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium truncate max-w-[260px] sm:max-w-none flex items-center gap-1.5 mt-0.5">
                    <span className="font-semibold text-slate-700">Salomão Muanjita Vinene Moises</span>
                    <span className="text-slate-300 hidden sm:inline">•</span>
                    <span className="text-slate-400 hidden sm:inline">NIF: 5002504642</span>
                  </p>
                </div>
              </div>

              {/* Mobile quick controls */}
              <div className="flex lg:hidden items-center gap-1">
                {onZeroAll && (
                  <button
                    id="btn-mobile-zero-header"
                    onClick={() => setIsZeroModalOpen(true)}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Zerar Contas e Despesas"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}

                <button
                  id="btn-mobile-invoices"
                  onClick={onOpenInvoices}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                  title="Facturação"
                >
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  {pendingInvoicesCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {pendingInvoicesCount}
                    </span>
                  )}
                </button>

                <button
                  id="btn-mobile-alerts"
                  onClick={onOpenAlerts}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                  title="Alertas"
                >
                  <Bell className="w-4 h-4" />
                  {alertCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {alertCount}
                    </span>
                  )}
                </button>

                <button
                  id="btn-mobile-new-tx"
                  onClick={onNewTransaction}
                  className="bg-blue-600 text-white px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs hover:bg-blue-700"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Lançar
                </button>
              </div>
            </div>

            {/* Right section: Balance highlight & Navigation actions */}
            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 sm:gap-2.5">
              {/* Executive Consolidated Balance Pill */}
              <div
                className="flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-xl shadow-xs border border-slate-800"
                title="Saldo somado de todas as contas bancárias e tesouraria"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-none">
                    Saldo Consolidado
                  </div>
                  <div className="text-sm sm:text-base font-extrabold tracking-tight text-emerald-400 font-mono leading-tight mt-0.5">
                    {formatCurrency(totalBalance)}
                  </div>
                </div>
              </div>

              {/* Timestamp on desktop */}
              <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-[11px]">
                  {time.toLocaleTimeString('pt-BR')} • {time.toLocaleDateString('pt-BR')}
                </span>
              </div>

              {/* Navigation and Tool Action Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Facturas */}
                <button
                  id="btn-open-invoices"
                  onClick={onOpenInvoices}
                  className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-blue-700 hover:border-blue-300 transition-all shadow-2xs"
                  title="Emissão e Gestão de Facturas"
                >
                  <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Facturas</span>
                  {pendingInvoicesCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full border border-amber-300">
                      {pendingInvoicesCount}
                    </span>
                  )}
                </button>

                {/* Relatórios & DFC */}
                <button
                  id="btn-open-reports"
                  onClick={onOpenReports}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-blue-700 hover:border-blue-300 transition-all shadow-2xs"
                  title="Demonstrativo de Fluxo de Caixa, DRE e Relatórios"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Relatórios & DFC</span>
                </button>

                {/* Contas */}
                <button
                  id="btn-open-accounts"
                  onClick={onOpenAccounts}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-blue-700 hover:border-blue-300 transition-all shadow-2xs"
                  title="Gerenciar Contas Bancárias e Caixas"
                >
                  <Wallet className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Contas</span>
                </button>

                {/* Automações */}
                <button
                  id="btn-open-automations"
                  onClick={onOpenAutomations}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-blue-700 hover:border-blue-300 transition-all shadow-2xs"
                  title="Regras e Automações de Recorrência"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Automações</span>
                </button>

                {/* Botão Zerar Tudo (Solicitado pelo Utilizador) */}
                {onZeroAll && (
                  <button
                    id="btn-header-zero-all"
                    onClick={() => setIsZeroModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50/80 border border-rose-200 rounded-xl hover:bg-rose-100 hover:border-rose-300 transition-all shadow-2xs"
                    title="Zerar Todas as Contas e Despesas para Kz 0,00"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                    <span className="hidden md:inline">Zerar Tudo</span>
                  </button>
                )}

                {/* Alertas */}
                <button
                  id="btn-header-alerts"
                  onClick={onOpenAlerts}
                  className="relative hidden sm:inline-flex items-center p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
                  title="Alertas & Monitoramento de Caixa"
                >
                  <Bell className="w-4 h-4" />
                  {alertCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {alertCount}
                    </span>
                  )}
                </button>

                {/* Sincronização Manual */}
                <button
                  id="btn-header-sync"
                  onClick={handleManualSync}
                  className={`p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs ${
                    isSyncing ? 'animate-spin text-blue-600' : ''
                  }`}
                  title="Recalcular Fluxo em Tempo Real"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                {/* Backup & Ajustes */}
                <button
                  id="btn-header-backup"
                  onClick={onOpenBackup}
                  className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
                  title="Backup e Configurações Globais"
                >
                  <Database className="w-4 h-4" />
                </button>

                {/* Nova Transação Primary Button */}
                <button
                  id="btn-header-new-transaction"
                  onClick={onNewTransaction}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs hover:shadow-md transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Nova Transação</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Confirmation Modal to Zero Accounts & Expenses */}
      {isZeroModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  Zerar Todas as Contas e Despesas?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Esta acção irá redefinir o saldo inicial de <strong>todas as contas bancárias e caixas para Kz 0,00</strong>,
                  apagar todos os lançamentos de receitas, despesas e facturas, deixando o sistema completamente limpo para você inserir os seus dados reais.
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <span>⚠️</span> O que será zerado:
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-amber-800 text-[11px]">
                <li>Saldo de todas as contas bancárias e tesouraria (Kz 0,00)</li>
                <li>Todas as despesas e receitas registradas</li>
                <li>Todas as facturas e orçamentos mensais</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsZeroModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmZero}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Sim, Zerar Tudo Agora
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
