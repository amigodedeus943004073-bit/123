import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Calendar,
  DollarSign,
  Tag,
  Wallet,
  Building,
  FileCheck,
  CheckCircle,
} from 'lucide-react';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
  PaymentMethod,
  Account,
  Category,
  CostCenter,
} from '../types/finance';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (txData: Partial<Transaction>) => void;
  accounts: Account[];
  categories: Category[];
  costCenters: CostCenter[];
  editingTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  accounts,
  categories,
  costCenters,
  editingTransaction,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [costCenterId, setCostCenterId] = useState('');
  const [status, setStatus] = useState<TransactionStatus>('completed');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [entityOrRecipient, setEntityOrRecipient] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setDescription(editingTransaction.description);
      setAmountStr(editingTransaction.amount.toString());
      setDate(editingTransaction.date);
      setDueDate(editingTransaction.dueDate || editingTransaction.date);
      setCategoryId(editingTransaction.category);
      setAccountId(editingTransaction.accountId);
      setToAccountId(editingTransaction.toAccountId || '');
      setCostCenterId(editingTransaction.costCenterId || '');
      setStatus(editingTransaction.status);
      setPaymentMethod(editingTransaction.paymentMethod);
      setEntityOrRecipient(editingTransaction.entityOrRecipient || '');
      setDocumentNumber(editingTransaction.documentNumber || '');
      setNotes(editingTransaction.notes || '');
    } else {
      // Defaults for new
      setType('expense');
      setDescription('');
      setAmountStr('');
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setDueDate(today);
      const defaultAcc = accounts[0]?.id || '';
      setAccountId(defaultAcc);
      setToAccountId(accounts[1]?.id || '');
      const defaultCat = categories.find((c) => c.type === 'expense')?.id || '';
      setCategoryId(defaultCat);
      setCostCenterId(costCenters[0]?.id || '');
      setStatus('completed');
      setPaymentMethod('pix');
      setEntityOrRecipient('');
      setDocumentNumber('');
      setNotes('');
    }
  }, [editingTransaction, isOpen, accounts, categories, costCenters]);

  // When type switches, reset category to matching type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType !== 'transfer') {
      const firstMatchingCat = categories.find((c) => c.type === newType);
      if (firstMatchingCat) {
        setCategoryId(firstMatchingCat.id);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor insira um valor válido maior que zero.');
      return;
    }
    if (!description.trim()) {
      alert('Por favor informe a descrição do lançamento.');
      return;
    }

    onSave({
      id: editingTransaction?.id,
      type,
      description: description.trim(),
      amount: parsedAmount,
      date,
      dueDate: dueDate || date,
      category: categoryId,
      accountId: accountId || accounts[0]?.id,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      costCenterId: costCenterId || undefined,
      status,
      paymentMethod,
      entityOrRecipient: entityOrRecipient.trim() || undefined,
      documentNumber: documentNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === (type === 'income' ? 'income' : 'expense'));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento Financeiro'}
            </h2>
            <p className="text-xs text-slate-500">
              Gestão de Fluxo de Caixa da SMVM
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Type selector */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              id="btn-tx-type-expense"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Despesa (Saída)
            </button>
            <button
              type="button"
              id="btn-tx-type-income"
              onClick={() => handleTypeChange('income')}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Receita (Entrada)
            </button>
            <button
              type="button"
              id="btn-tx-type-transfer"
              onClick={() => handleTypeChange('transfer')}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                type === 'transfer'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              Transferência
            </button>
          </div>

          {/* Amount & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Valor (R$) *
              </label>
              <input
                id="input-tx-amount"
                type="text"
                required
                placeholder="0,00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descrição do Lançamento *
              </label>
              <input
                id="input-tx-desc"
                type="text"
                required
                placeholder="Ex: Pagamento Energia Sede, Doação Mantenedor..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Dates: Competência & Vencimento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data do Lançamento *
              </label>
              <input
                id="input-tx-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data de Vencimento
              </label>
              <input
                id="input-tx-duedate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Category & Cost Center (if not transfer) */}
          {type !== 'transfer' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Categoria *
                </label>
                <select
                  id="select-tx-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Centro de Custo SMVM
                </label>
                <select
                  id="select-tx-cost-center"
                  value={costCenterId}
                  onChange={(e) => setCostCenterId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="">Não informado</option>
                  {costCenters.map((cc) => (
                    <option key={cc.id} value={cc.id}>
                      {cc.code} - {cc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            /* Transfer: Origin & Destination */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Conta de Origem (Sai de) *
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Conta de Destino (Entra em) *
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Account & Payment Method (for non-transfer) */}
          {type !== 'transfer' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Conta Bancária / Caixa *
                </label>
                <select
                  id="select-tx-account"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Forma de Pagamento
                </label>
                <select
                  id="select-tx-payment-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="pix">PIX</option>
                  <option value="boleto">Boleto Bancário</option>
                  <option value="transferencia">Transferência / TED</option>
                  <option value="cartao_credito">Cartão de Crédito</option>
                  <option value="cartao_debito">Cartão de Débito</option>
                  <option value="dinheiro">Dinheiro em Espécie</option>
                  <option value="outro">Outro / Cheque</option>
                </select>
              </div>
            </div>
          )}

          {/* Entity & Document Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {type === 'income' ? 'Pagador / Doador / Cliente' : 'Fornecedor / Favorecido'}
              </label>
              <input
                id="input-tx-entity"
                type="text"
                placeholder="Nome da pessoa física ou jurídica"
                value={entityOrRecipient}
                onChange={(e) => setEntityOrRecipient(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nº Documento / Recibo / NF
              </label>
              <input
                id="input-tx-doc"
                type="text"
                placeholder="Ex: NF-1029, PIX-19401"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status da Transação
            </label>
            <div className="flex gap-4 text-xs font-medium">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="completed"
                  checked={status === 'completed'}
                  onChange={() => setStatus('completed')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-emerald-700 font-semibold">Realizado (Efetivado no Caixa)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="pending"
                  checked={status === 'pending'}
                  onChange={() => setStatus('pending')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-amber-700 font-semibold">Pendente (A Pagar / A Receber)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="scheduled"
                  checked={status === 'scheduled'}
                  onChange={() => setStatus('scheduled')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-indigo-700 font-semibold">Agendado</span>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-save-transaction"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              {editingTransaction ? 'Salvar Alterações' : 'Confirmar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
