import React from 'react';
import {
  X,
  Bell,
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import { FinancialAlert, Transaction } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: FinancialAlert[];
  pendingTransactions: Transaction[];
  onQuickPay: (tx: Transaction) => void;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({
  isOpen,
  onClose,
  alerts,
  pendingTransactions,
  onQuickPay,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Central de Alertas & Monitoramento
              </h2>
              <p className="text-xs text-slate-500">
                Auditoria em tempo real e pontos de atenção do caixa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Automated system alerts */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Diagnósticos Automáticos
            </h3>
            {alerts.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Nenhuma anomalia financeira ou risco de liquidez detectado no momento.</span>
              </div>
            ) : (
              alerts.map((al) => (
                <div
                  key={al.id}
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                    al.type === 'danger'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : al.type === 'warning'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-blue-50 border-blue-200 text-blue-900'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">{al.title}</div>
                    <div className="text-[11px] opacity-90 mt-0.5">{al.message}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pending Bills demanding attention */}
          <div className="space-y-2.5 pt-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Contas com Vencimento Próximo
            </h3>
            {pendingTransactions.length === 0 ? (
              <div className="text-xs text-slate-400 py-3 text-center">
                Todas as despesas e receitas estão baixadas e em dia.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {pendingTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 truncate max-w-[200px]">
                        {tx.description}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>Vence em {formatDate(tx.dueDate || tx.date)}</span>
                        <span>•</span>
                        <span className="font-mono font-semibold text-rose-600">
                          {formatCurrency(tx.amount)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onQuickPay(tx)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle className="w-3 h-3" /> Baixar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Monitoramento em tempo real ativo</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
