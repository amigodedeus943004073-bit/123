import React, { useRef, useState } from 'react';
import {
  X,
  Database,
  Download,
  Upload,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import {
  Account,
  Category,
  CostCenter,
  Transaction,
  AutomationRule,
  Invoice,
  InvoiceEmitter,
} from '../types/finance';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  costCenters: CostCenter[];
  transactions: Transaction[];
  automations: AutomationRule[];
  invoices: Invoice[];
  emitterSettings: InvoiceEmitter;
  onImportData: (data: any) => void;
  onResetData: () => void;
  onClearTransactions?: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  accounts,
  categories,
  costCenters,
  transactions,
  automations,
  invoices,
  emitterSettings,
  onImportData,
  onResetData,
  onClearTransactions,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const backupData = {
      version: '1.1',
      exportedAt: new Date().toISOString(),
      organization: 'SMVM - Sociedade / Missão',
      accounts,
      categories,
      costCenters,
      transactions,
      automations,
      invoices,
      emitterSettings,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_financeiro_smvm_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed && parsed.transactions && parsed.accounts) {
          onImportData(parsed);
          onClose();
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch (err) {
        alert('Erro ao ler arquivo JSON de backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteReset = () => {
    onResetData();
    setShowResetConfirm(false);
    onClose();
  };

  const handleExecuteClear = () => {
    if (onClearTransactions) {
      onClearTransactions();
    }
    setShowClearConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Segurança, Backup & Exportação
              </h2>
              <p className="text-xs text-slate-500">
                Preservação e integridade dos registros contábeis da SMVM
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
        <div className="p-4 sm:p-6 space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              Todos os lançamentos, regras e saldos ficam salvos de forma segura no seu navegador (LocalStorage) com sincronização em tempo real. Você também pode exportar arquivos para auditoria.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExportJSON}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all text-left flex flex-col justify-between group"
            >
              <Download className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Exportar Backup Completo
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Salva tudo em arquivo JSON
                </span>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all text-left flex flex-col justify-between group"
            >
              <Upload className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Importar Backup
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Restaurar de arquivo JSON
                </span>
              </div>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-3">
            {/* Reset Demo section */}
            {showResetConfirm ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Confirmar Restauração dos Dados de Demonstração?</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Os lançamentos atuais serão redefinidos para os registros originais da SMVM.
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteReset}
                    className="px-2.5 py-1 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
                  >
                    Sim, Restaurar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Restaurar Base de Demonstração SMVM
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Recarrega as contas, categorias e transações padrão
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Restaurar
                </button>
              </div>
            )}

            {/* Clear all transactions section */}
            {onClearTransactions && (
              <>
                {showClearConfirm ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Confirmar Limpeza e Zeramento do Caixa?</span>
                    </div>
                    <p className="text-[11px] text-rose-800 leading-relaxed">
                      Todas as transações serão apagadas e a lista ficará vazia (0 registros).
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowClearConfirm(false)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleExecuteClear}
                        className="px-2.5 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Sim, Limpar e Zerar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-rose-700 block">
                        Limpar Todos os Lançamentos
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Zera todas as transações para você iniciar a digitação do zero
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(true)}
                      className="px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Limpar Tudo
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
