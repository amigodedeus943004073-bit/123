import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Plus,
  Play,
  CheckCircle2,
  Trash2,
  Power,
  Calendar,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AutomationRule,
  Account,
  Category,
  CostCenter,
  PaymentMethod,
} from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface AutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  automations: AutomationRule[];
  onSaveAutomation: (rule: AutomationRule) => void;
  onDeleteAutomation: (id: string) => void;
  onToggleAutomation: (id: string) => void;
  onExecuteAutomationsNow: () => void;
  accounts: Account[];
  categories: Category[];
  costCenters: CostCenter[];
}

export const AutomationModal: React.FC<AutomationModalProps> = ({
  isOpen,
  onClose,
  automations,
  onSaveAutomation,
  onDeleteAutomation,
  onToggleAutomation,
  onExecuteAutomationsNow,
  accounts,
  categories,
  costCenters,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [costCenterId, setCostCenterId] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState<number>(10);
  const [autoConfirm, setAutoConfirm] = useState<boolean>(false);
  const [entityOrRecipient, setEntityOrRecipient] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setIsCreating(true);
    setTitle('');
    setDescription('');
    setType('expense');
    setAmountStr('');
    setAccountId(accounts[0]?.id || '');
    setCostCenterId(costCenters[0]?.id || '');
    const defaultCat = categories.find((c) => c.type === 'expense')?.id || '';
    setCategoryId(defaultCat);
    setDayOfMonth(10);
    setAutoConfirm(false);
    setEntityOrRecipient('');
    setPaymentMethod('pix');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      alert('Informe um valor válido.');
      return;
    }
    if (!title.trim()) {
      alert('Informe o título da regra.');
      return;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const nextDueDate = `${year}-${String(month).padStart(2, '0')}-${String(dayOfMonth).padStart(2, '0')}`;

    const newRule: AutomationRule = {
      id: `auto-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      amount,
      category: categoryId,
      accountId: accountId || accounts[0]?.id,
      costCenterId: costCenterId || undefined,
      frequency: 'monthly',
      dayOfMonth,
      active: true,
      autoConfirm,
      nextDueDate,
      entityOrRecipient: entityOrRecipient.trim() || undefined,
      paymentMethod,
    };

    onSaveAutomation(newRule);
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Automações de Fluxo de Caixa Recorrente
              </h2>
              <p className="text-xs text-slate-500">
                Provisionamento automático de contas a pagar e receber da SMVM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCreating && (
              <button
                id="btn-auto-exec-now"
                onClick={onExecuteAutomationsNow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
                title="Verifica regras de vencimento e gera lançamentos pendentes automaticamente"
              >
                <Play className="w-3.5 h-3.5 fill-blue-700" />
                <span>Processar Agora</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {isCreating ? (
            /* Creation Form */
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="font-bold text-slate-800 text-sm">
                  Nova Regra Automática
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Voltar para a lista
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${
                    type === 'expense'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" /> Despesa Recorrente
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${
                    type === 'income'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" /> Receita Recorrente
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome da Regra / Identificação *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Aluguel da Sede, Energia Elétrica, Folha Mensal"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valor Estimado (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0,00"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dia de Vencimento no Mês *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    required
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    {categories
                      .filter((c) => c.type === type)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Conta Débito/Crédito *
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Favorecido / Fornecedor / Pagador
                  </label>
                  <input
                    type="text"
                    placeholder="Nome da instituição ou empresa"
                    value={entityOrRecipient}
                    onChange={(e) => setEntityOrRecipient(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pix">PIX</option>
                    <option value="boleto">Boleto Bancário</option>
                    <option value="transferencia">Transferência / TED</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="dinheiro">Dinheiro</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoConfirm}
                    onChange={(e) => setAutoConfirm(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Liquidação Automática (Auto-Efetivar)
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Se ativado, a transação é criada diretamente como "Realizado" no dia do vencimento. Caso desmarcado, entra como "Pendente" para conferência prévia da diretoria.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Criar Regra de Automação
                </button>
              </div>
            </form>
          ) : (
            /* Rules List */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-600">
                  Total de <strong>{automations.length}</strong> regras automáticas configuradas.
                </div>
                <button
                  id="btn-add-automation-rule"
                  onClick={handleStartCreate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nova Regra
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {automations.map((rule) => {
                  const category = categories.find((c) => c.id === rule.category);
                  const account = accounts.find((a) => a.id === rule.accountId);

                  return (
                    <div
                      key={rule.id}
                      className={`p-4 rounded-xl border transition-all ${
                        rule.active
                          ? 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                          : 'border-slate-200 bg-slate-50/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => onToggleAutomation(rule.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              rule.active
                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                            }`}
                            title={rule.active ? 'Regra Ativa (clique para pausar)' : 'Regra Pausada (clique para ativar)'}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-sm">
                                {rule.title}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  rule.type === 'income'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {rule.type === 'income' ? 'Receita' : 'Despesa'}
                              </span>
                              {rule.autoConfirm && (
                                <span className="bg-indigo-50 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                                  <Zap className="w-2.5 h-2.5 text-indigo-600" />
                                  Auto-Baixa
                                </span>
                              )}
                            </div>

                            {rule.description && (
                              <p className="text-xs text-slate-500 mt-0.5">
                                {rule.description}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                Todo dia <strong>{rule.dayOfMonth}</strong> de cada mês
                              </span>
                              <span>•</span>
                              <span>
                                Conta: <strong>{account?.name || 'Padrão'}</strong>
                              </span>
                              {rule.entityOrRecipient && (
                                <>
                                  <span>•</span>
                                  <span>{rule.entityOrRecipient}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div
                              className={`text-base font-extrabold font-mono ${
                                rule.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {formatCurrency(rule.amount)}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Vence dia {rule.dayOfMonth}
                            </div>
                          </div>

                          <button
                            onClick={() => onDeleteAutomation(rule.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Excluir regra"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>
            O motor de automação provisiona o fluxo de caixa sem intervenção manual.
          </span>
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
