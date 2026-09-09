import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, CheckSquare, Square, RefreshCw } from 'lucide-react';

interface ClearTransactionsModalProps {
  isOpen: boolean;
  transactionsCount: number;
  onClose: () => void;
  onConfirmClear: (zeroAccountBalances: boolean) => void;
}

export const ClearTransactionsModal: React.FC<ClearTransactionsModalProps> = ({
  isOpen,
  transactionsCount,
  onClose,
  onConfirmClear,
}) => {
  const [zeroAccountBalances, setZeroAccountBalances] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirmClear(zeroAccountBalances);
    onClose();
  };

  return (
    <div
      id="modal-clear-transactions-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="modal-clear-transactions-card"
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-rose-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-rose-50/70 border-b border-rose-100 p-5 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-rose-950">
                Limpar e Zerar Lançamentos
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-rose-100/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-rose-700/90 mt-0.5 font-medium">
              Zerar fluxo de caixa e registros para nova digitação
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-600">
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-amber-900 text-xs leading-relaxed font-medium">
              Você está prestes a apagar <strong>{transactionsCount} lançamentos</strong> do sistema financeiro.
              Após a confirmação, o extrato e os relatórios serão reiniciados vazios.
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-slate-700 font-semibold text-xs">
              O que acontecerá ao confirmar:
            </div>
            <ul className="space-y-1.5 pl-4 list-disc text-slate-600 marker:text-rose-500">
              <li>Todas as receitas, despesas e transferências serão removidas.</li>
              <li>O gráfico de fluxo de caixa iniciará a partir dos novos lançamentos.</li>
              <li>Suas contas bancárias, categorias e centros de custo serão mantidos.</li>
            </ul>
          </div>

          {/* Option: Zero account initial balances */}
          <div
            onClick={() => setZeroAccountBalances(!zeroAccountBalances)}
            className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl cursor-pointer flex items-center justify-between transition-colors select-none"
          >
            <div className="flex items-center gap-2.5">
              {zeroAccountBalances ? (
                <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <div>
                <span className="font-semibold text-slate-800 block text-xs">
                  Zerar também saldos das contas bancárias
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Define o saldo inicial de cada banco em R$ 0,00
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              {zeroAccountBalances ? 'R$ 0,00' : 'Manter'}
            </span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            id="btn-cancel-clear-tx"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors shadow-xs"
          >
            Cancelar
          </button>
          <button
            type="button"
            id="btn-confirm-clear-tx"
            onClick={handleConfirm}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-colors flex items-center gap-2 shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar e Zerar Agora</span>
          </button>
        </div>
      </div>
    </div>
  );
};
