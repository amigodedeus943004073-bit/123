import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  FileText,
  Calculator,
  Building,
  User,
  Calendar,
  CreditCard,
  CheckCircle2,
  Info,
} from 'lucide-react';
import {
  Invoice,
  InvoiceItem,
  InvoiceType,
  InvoiceStatus,
  InvoiceEmitter,
  Account,
  CostCenter,
  PaymentMethod,
} from '../types/finance';
import { formatInvoiceCurrency } from '../utils/formatters';
import { SMVMLogo } from './SMVMLogo';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveInvoice: (invoice: Invoice, syncToCashFlow: boolean) => void;
  emitterSettings: InvoiceEmitter;
  accounts: Account[];
  costCenters: CostCenter[];
  editingInvoice?: Invoice | null;
  existingInvoicesCount: number;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  onSaveInvoice,
  emitterSettings,
  accounts,
  costCenters,
  editingInvoice,
  existingInvoicesCount,
}) => {
  const currentYear = new Date().getFullYear();
  const nextSeq = String(existingInvoicesCount + 1).padStart(3, '0');

  // Form states
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [type, setType] = useState<InvoiceType>('FT');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<InvoiceStatus>('issued');
  const [currency, setCurrency] = useState<'BRL' | 'EUR' | 'AOA' | 'USD'>('AOA');

  // Client states (Principal: Nome do Cliente e NIF)
  const [clientName, setClientName] = useState('');
  const [clientTaxId, setClientTaxId] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [clientCountry, setClientCountry] = useState('Angola');

  // Destination and accounting
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [costCenterId, setCostCenterId] = useState(costCenters[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transferencia');
  const [notes, setNotes] = useState('');
  const [taxExemptionReason, setTaxExemptionReason] = useState(
    'Isenção nos termos do Código do IVA / Legislação Geral'
  );
  const [withholdingTaxRate, setWithholdingTaxRate] = useState<number>(0);
  const [syncToCashFlow, setSyncToCashFlow] = useState(true);

  // Line items (Produto, Quantidade, Preço Unitário, Valor Total)
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'item-1',
      description: 'Prestação de Serviços / Apoio Institucional',
      quantity: 1,
      unitPrice: 50000,
      taxRate: 0,
      discountPercent: 0,
      total: 50000,
    },
  ]);

  // Load editing invoice or set defaults
  useEffect(() => {
    if (editingInvoice) {
      setInvoiceNumber(editingInvoice.invoiceNumber);
      setType(editingInvoice.type);
      setIssueDate(editingInvoice.issueDate);
      setDueDate(editingInvoice.dueDate);
      setStatus(editingInvoice.status);
      setCurrency((editingInvoice.currency as any) || 'AOA');
      setClientName(editingInvoice.client.name);
      setClientTaxId(editingInvoice.client.taxId);
      setClientEmail(editingInvoice.client.email || '');
      setClientPhone(editingInvoice.client.phone || '');
      setClientAddress(editingInvoice.client.address || '');
      setClientCity(editingInvoice.client.city || '');
      setClientCountry(editingInvoice.client.country || 'Angola');
      setAccountId(editingInvoice.accountId || accounts[0]?.id || '');
      setCostCenterId(editingInvoice.costCenterId || costCenters[0]?.id || '');
      setPaymentMethod(editingInvoice.paymentMethod || 'transferencia');
      setNotes(editingInvoice.notes || '');
      setTaxExemptionReason(editingInvoice.taxExemptionReason || '');
      setWithholdingTaxRate(editingInvoice.withholdingTaxRate || 0);
      setItems(editingInvoice.items);
      setSyncToCashFlow(!!editingInvoice.linkedTransactionId);
    } else {
      // New invoice
      const defaultDue = new Date();
      defaultDue.setDate(defaultDue.getDate() + 15);
      setInvoiceNumber(`FT ${currentYear}/${nextSeq}`);
      setType('FT');
      setIssueDate(new Date().toISOString().split('T')[0]);
      setDueDate(defaultDue.toISOString().split('T')[0]);
      setStatus('issued');
      setCurrency('AOA');
      setClientName('');
      setClientTaxId('');
      setClientEmail('');
      setClientPhone('');
      setClientAddress('');
      setClientCity('');
      setClientCountry('Angola');
      setAccountId(accounts[0]?.id || '');
      setCostCenterId(costCenters[0]?.id || '');
      setPaymentMethod('transferencia');
      setNotes('Agradecemos a preferência comercial.');
      setTaxExemptionReason(
        'Isenção nos termos do Código do IVA'
      );
      setWithholdingTaxRate(0);
      setItems([
        {
          id: `item-${Date.now()}`,
          description: '',
          quantity: 1,
          unitPrice: 0,
          taxRate: 0,
          discountPercent: 0,
          total: 0,
        },
      ]);
      setSyncToCashFlow(true);
    }
  }, [editingInvoice, isOpen, currentYear, nextSeq, accounts, costCenters]);

  if (!isOpen) return null;

  // Item handlers
  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    val: string | number
  ) => {
    const updated = [...items];
    const currentItem = { ...updated[index] };

    if (field === 'description') {
      currentItem.description = String(val);
    } else if (field === 'quantity') {
      currentItem.quantity = Math.max(0, Number(val) || 0);
    } else if (field === 'unitPrice') {
      currentItem.unitPrice = Math.max(0, Number(val) || 0);
    } else if (field === 'taxRate') {
      currentItem.taxRate = Math.max(0, Number(val) || 0);
    } else if (field === 'discountPercent') {
      currentItem.discountPercent = Math.min(100, Math.max(0, Number(val) || 0));
    }

    // Recalculate line total: qty * unitPrice * (1 - discount/100)
    const discountFactor = 1 - currentItem.discountPercent / 100;
    const baseTotal = currentItem.quantity * currentItem.unitPrice * discountFactor;
    currentItem.total = Math.round(baseTotal * 100) / 100;

    updated[index] = currentItem;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}-${items.length + 1}`,
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 0,
        discountPercent: 0,
        total: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      alert('A factura deve conter pelo menos uma linha de serviço/produto.');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  // Totals calculations
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalDiscount = items.reduce(
    (sum, item) => sum + (item.quantity * item.unitPrice * item.discountPercent) / 100,
    0
  );
  const totalTax = items.reduce((sum, item) => {
    const discountedItemTotal = item.quantity * item.unitPrice * (1 - item.discountPercent / 100);
    return sum + (discountedItemTotal * item.taxRate) / 100;
  }, 0);

  const baseBeforeWithholding = subtotal - totalDiscount + totalTax;
  const withholdingTaxAmount = (baseBeforeWithholding * (withholdingTaxRate || 0)) / 100;
  const totalAmount = Math.max(0, baseBeforeWithholding - withholdingTaxAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      alert('Por favor, informe o Nome ou Razão Social do Cliente.');
      return;
    }

    if (items.length === 0 || items.every((it) => it.quantity <= 0 || it.unitPrice <= 0)) {
      alert('Por favor, adicione ao menos um item com quantidade e valor válidos.');
      return;
    }

    const newInvoice: Invoice = {
      id: editingInvoice?.id || `inv-${Date.now()}`,
      invoiceNumber: invoiceNumber.trim() || `FT ${currentYear}/${nextSeq}`,
      type,
      issueDate,
      dueDate: dueDate || issueDate,
      status,
      client: {
        name: clientName.trim(),
        taxId: clientTaxId.trim() || 'Consumidor Final',
        email: clientEmail.trim() || undefined,
        phone: clientPhone.trim() || undefined,
        address: clientAddress.trim() || undefined,
        city: clientCity.trim() || undefined,
        country: clientCountry.trim() || 'Brasil',
      },
      emitter: emitterSettings,
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      totalDiscount: Math.round(totalDiscount * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      withholdingTaxRate,
      withholdingTaxAmount: Math.round(withholdingTaxAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      currency,
      paymentMethod,
      notes: notes.trim() || undefined,
      taxExemptionReason: taxExemptionReason.trim() || undefined,
      linkedTransactionId: editingInvoice?.linkedTransactionId,
      accountId,
      costCenterId,
      createdAt: editingInvoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveInvoice(newInvoice, syncToCashFlow);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {editingInvoice ? 'Editar Factura' : 'Emitir Nova Factura / Recibo'}
              </h2>
              <p className="text-xs text-slate-500">
                Emissão oficial com cálculo de impostos, retenções e integração ao caixa SMVM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {/* Section 1: Empresa SMVM & Document Identification */}
            <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <SMVMLogo size="lg" />
                <div>
                  <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider block">
                    Empresa Emissora
                  </span>
                  <h3 className="text-base font-extrabold text-white">
                    {emitterSettings.name || 'EMPRESA SMVM'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    NIF: <span className="font-mono text-white font-bold">{emitterSettings.taxId || '5002504642'}</span> • {emitterSettings.city || 'Cuito - Bié'}, {emitterSettings.country || 'Angola'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-mono font-bold px-3 py-1 rounded-lg">
                  {invoiceNumber}
                </span>
                <span className="text-xs bg-white/10 px-2.5 py-1 rounded-lg text-slate-200 font-semibold">
                  Moeda: Kwanza (Kz)
                </span>
              </div>
            </div>

            {/* Document Controls & Dates */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tipo de Factura *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as InvoiceType)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="FT">Factura (FT)</option>
                    <option value="FR">Factura-Recibo (FR)</option>
                    <option value="FP">Factura Pró-Forma (FP)</option>
                    <option value="NC">Nota de Crédito (NC)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Número da Factura *
                  </label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="FT 2026/001"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Data de Emissão *
                  </label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Data de Vencimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Client Information (Apenas Nome do Cliente e NIF) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" />
                Dados do Cliente / Destinatário
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: Nome da Empresa ou Nome Completo do Cliente"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    NIF (Número de Identificação Fiscal) *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientTaxId}
                    onChange={(e) => setClientTaxId(e.target.value)}
                    placeholder="Ex: 5002504642 ou Consumidor Final"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Tabela Normal de Produtos (Produto, Quantidade, Valor Total) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  Produtos / Serviços Faturados
                </span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Produto
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Produto / Serviço</th>
                        <th className="py-2.5 px-2 w-24 text-center">Quantidade</th>
                        <th className="py-2.5 px-3 w-36 text-right">Preço Unitário (Kz)</th>
                        <th className="py-2.5 px-3 w-40 text-right">Valor Total (Kz)</th>
                        <th className="py-2.5 px-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              required
                              placeholder="Nome do produto ou descrição do serviço..."
                              value={item.description}
                              onChange={(e) =>
                                handleItemChange(idx, 'description', e.target.value)
                              }
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-2.5 px-2">
                            <input
                              type="number"
                              min="1"
                              step="any"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)
                              }
                              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-center font-mono font-bold text-slate-900 focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)
                              }
                              placeholder="0,00"
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-right font-mono font-semibold text-slate-900 focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {formatInvoiceCurrency(item.total, currency)}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                                title="Remover este produto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Section 4: Condições de Pagamento & Valor Total */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-1">
              <div className="sm:col-span-7 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Forma de Pagamento
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="transferencia">Transferência Bancária (IBAN)</option>
                      <option value="outro">Multicaixa Express</option>
                      <option value="dinheiro">Numerário / Depósito em Caixa</option>
                      <option value="cartao_credito">Cartão de Crédito / TPA</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Conta SMVM Destino
                    </label>
                    <select
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="check-sync-cashflow"
                      checked={syncToCashFlow}
                      onChange={(e) => setSyncToCashFlow(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="check-sync-cashflow"
                      className="cursor-pointer font-bold select-none text-slate-800"
                    >
                      Lançar no Fluxo de Caixa da SMVM
                    </label>
                  </div>
                  <span className="text-[11px] text-blue-700 hidden sm:inline font-medium">
                    Regista automaticamente como receita no financeiro
                  </span>
                </div>
              </div>

              {/* Totals Summary Box */}
              <div className="sm:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-200 pb-1">
                  Resumo da Factura
                </span>

                <div className="flex justify-between text-xs text-slate-600 pt-1">
                  <span>Qtd de Produtos:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {items.reduce((acc, it) => acc + (it.quantity || 0), 0)}
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-slate-900">
                  <span className="text-xs font-black uppercase text-slate-800">
                    VALOR TOTAL:
                  </span>
                  <span className="text-xl font-black font-mono text-blue-700">
                    {formatInvoiceCurrency(totalAmount, currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              {editingInvoice ? 'Salvar Alterações' : 'Emitir Factura Oficial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
