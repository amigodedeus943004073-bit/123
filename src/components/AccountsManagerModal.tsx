import React, { useState } from 'react';
import {
  X,
  Wallet,
  Plus,
  ArrowLeftRight,
  Building,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Account, Transaction } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface AccountsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  balances: Record<string, number>;
  onSaveAccount: (account: Account) => void;
  onTransfer: (fromId: string, toId: string, amount: number, description: string) => void;
}

export const AccountsManagerModal: React.FC<AccountsManagerModalProps> = ({
  isOpen,
  onClose,
  accounts,
  balances,
  onSaveAccount,
  onTransfer,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'new' | 'transfer'>('list');

  // Form for new account
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('corrente');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [initialBalanceStr, setInitialBalanceStr] = useState('0');
  const [color, setColor] = useState('#2563eb');
  const [description, setDescription] = useState('');

  // Form for transfer
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || '');
  const [transferAmountStr, setTransferAmountStr] = useState('');
  const [transferDesc, setTransferDesc] = useState('Transferência entre contas SMVM');

  if (!isOpen) return null;

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const initialBalance = parseFloat(initialBalanceStr.replace(',', '.')) || 0;
    if (!name.trim()) return;

    const newAcc: Account = {
      id: `acc-${Date.now()}`,
      name: name.trim(),
      type,
      bankName: bankName.trim() || 'Instituição Financeira',
      accountNumber: accountNumber.trim() || undefined,
      initialBalance,
      color,
      description: description.trim() || undefined,
    };

    onSaveAccount(newAcc);
    setActiveTab('list');
    setName('');
    setBankName('');
    setAccountNumber('');
    setInitialBalanceStr('0');
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transferAmountStr.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      alert('Informe um valor válido.');
      return;
    }
    if (fromAccountId === toAccountId) {
      alert('A conta de origem e destino devem ser diferentes.');
      return;
    }

    onTransfer(fromAccountId, toAccountId, amount, transferDesc);
    setActiveTab('list');
    setTransferAmountStr('');
  };

  const totalConsolidated = accounts.reduce(
    (sum, acc) => sum + (balances[acc.id] ?? acc.initialBalance),
    0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Gestão de Contas Bancárias & Tesouraria
              </h2>
              <p className="text-xs text-slate-500">
                Saldos em tempo real por instituição financeira
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

        {/* Tab switcher */}
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/50 flex gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'list'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Contas Ativas ({accounts.length})
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
              activeTab === 'transfer'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" /> Transferência entre Contas
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
              activeTab === 'new'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Cadastrar Nova Conta
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Saldo Total Consolidado
                </span>
                <span className="text-base font-extrabold text-blue-800 font-mono">
                  {formatCurrency(totalConsolidated)}
                </span>
              </div>

              <div className="space-y-3">
                {accounts.map((acc) => {
                  const currentBalance = balances[acc.id] ?? acc.initialBalance;
                  return (
                    <div
                      key={acc.id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white shadow-xs transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs"
                          style={{ backgroundColor: acc.color }}
                        >
                          {acc.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{acc.name}</h4>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="capitalize font-medium">{acc.type}</span>
                            {acc.accountNumber && (
                              <>
                                <span>•</span>
                                <span className="font-mono">{acc.accountNumber}</span>
                              </>
                            )}
                          </div>
                          {acc.description && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {acc.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Saldo Atual
                        </span>
                        <span
                          className={`text-base font-extrabold font-mono ${
                            currentBalance >= 0 ? 'text-slate-900' : 'text-rose-600'
                          }`}
                        >
                          {formatCurrency(currentBalance)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'transfer' && (
            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                Movimente valores entre contas (ex: aporte para Fundo de Reserva ou retirada para Caixa Físico da Tesouraria).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Conta de Origem (Debitar)
                  </label>
                  <select
                    value={fromAccountId}
                    onChange={(e) => setFromAccountId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({formatCurrency(balances[a.id] ?? a.initialBalance)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Conta de Destino (Creditar)
                  </label>
                  <select
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({formatCurrency(balances[a.id] ?? a.initialBalance)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valor a Transferir (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0,00"
                    value={transferAmountStr}
                    onChange={(e) => setTransferAmountStr(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Descrição da Operação
                  </label>
                  <input
                    type="text"
                    value={transferDesc}
                    onChange={(e) => setTransferDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Executar Transferência
                </button>
              </div>
            </form>
          )}

          {activeTab === 'new' && (
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome da Conta *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Santander Operacional, Caixa Eventos"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Conta
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="corrente">Conta Corrente</option>
                    <option value="caixa_fisico">Caixa Físico / Tesouraria</option>
                    <option value="investimento">Aplicação / Investimento</option>
                    <option value="poupanca">Poupança</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Instituição / Banco
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Itaú, BB, Caixa"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Agência / Conta
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Ag 1020 / CC 3991-0"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Saldo Inicial (R$)
                  </label>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={initialBalanceStr}
                    onChange={(e) => setInitialBalanceStr(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Finalidade / Observações
                </label>
                <textarea
                  rows={2}
                  placeholder="Finalidade da conta no contexto da SMVM"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Salvar Nova Conta
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>SMVM • Gestão Multicontas e Conciliação</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
