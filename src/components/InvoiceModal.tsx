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
  const [currency, setCurrency] = useState<'BRL' | 'EUR' | 'AOA' | 'USD'>('BRL');

  // Client states
  const [clientName, setClientName] = useState('');
  const [clientTaxId, setClientTaxId] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [clientCountry, setClientCountry] = useState('Brasil');

  // Destination and accounting
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [costCenterId, setCostCenterId] = useState(costCenters[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [notes, setNotes] = useState('');
  const [taxExemptionReason, setTaxExemptionReason] = useState(
    'Isenção nos termos do Art. 150, VI, "c" da CF/88 (Entidade Imune/Isenta)'
  );
  const [withholdingTaxRate, setWithholdingTaxRate] = useState<number>(0);
  const [syncToCashFlow, setSyncToCashFlow] = useState(true);

  // Line items
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'item-1',
      description: 'Prestação de Serviços / Taxa de Inscrição / Apoio Institucional',
      quantity: 1,
      unitPrice: 1500,
      taxRate: 0,
      discountPercent: 0,
      total: 1500,
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
      setCurrency((editingInvoice.currency as any) || 'BRL');
      setClientName(editingInvoice.client.name);
      setClientTaxId(editingInvoice.client.taxId);
      setClientEmail(editingInvoice.client.email || '');
      setClientPhone(editingInvoice.client.phone || '');
      setClientAddress(editingInvoice.client.address || '');
      setClientCity(editingInvoice.client.city || '');
      setClientCountry(editingInvoice.client.country || 'Brasil');
      setAccountId(editingInvoice.accountId || accounts[0]?.id || '');
      setCostCenterId(editingInvoice.costCenterId || costCenters[0]?.id || '');
      setPaymentMethod(editingInvoice.paymentMethod || 'pix');
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
      setCurrency('BRL');
      setClientName('');
      setClientTaxId('');
      setClientEmail('');
      setClientPhone('');
      setClientAddress('');
      setClientCity('');
      setClientCountry('Brasil');
      setAccountId(accounts[0]?.id || '');
      setCostCenterId(costCenters[0]?.id || '');
      setPaymentMethod('pix');
      setNotes('Obrigado pela preferência e apoio à obra social da SMVM.');
      setTaxExemptionReason(
        'Isenção nos termos do Art. 150, VI, "c" da CF/88 (Entidade Imune/Isenta)'
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
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
            {/* Section 1: Document Settings */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  Identificação do Documento Fiscal
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Emissor: <strong className="text-slate-800">{emitterSettings.name}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tipo de Documento *
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
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Estado / Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Rascunho (Em preparação)</option>
                    <option value="issued">Emitida (Aguardando Liquidação)</option>
                    <option value="paid">Paga / Liquidada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Moeda da Operação
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BRL">BRL (R$ - Real)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                    <option value="AOA">AOA (Kz - Kwanza)</option>
                    <option value="USD">USD ($ - Dólar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pix">PIX</option>
                    <option value="transferencia">Transferência Bancária / IBAN</option>
                    <option value="boleto">Boleto Bancário</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="dinheiro">Numerário / Espécie</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Conta Destino (Tesouraria)
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Client Information */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Dados do Destinatário / Cliente
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome / Razão Social do Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: Fundação Aliança Social, Empresa Beta Ltda, ou Pessoa Física"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIF / CNPJ / CPF *
                  </label>
                  <input
                    type="text"
                    value={clientTaxId}
                    onChange={(e) => setClientTaxId(e.target.value)}
                    placeholder="00.000.000/0001-00 ou NIF"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="financeiro@empresa.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefone / Contato
                  </label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+55 (11) 99999-9999"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Endereço / Cidade
                  </label>
                  <input
                    type="text"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Rua, Número, Bairro, Cidade"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Line Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-blue-600" />
                  Linhas de Serviços / Produtos Faturados
                </span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Linha
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3 w-5/12">Descrição do Item / Serviço</th>
                        <th className="py-2.5 px-2 w-20 text-center">Qtd</th>
                        <th className="py-2.5 px-2 w-28 text-right">Preço Unit.</th>
                        <th className="py-2.5 px-2 w-20 text-center">Desc. %</th>
                        <th className="py-2.5 px-2 w-20 text-center">Taxa IVA %</th>
                        <th className="py-2.5 px-3 w-28 text-right">Total Líquido</th>
                        <th className="py-2.5 px-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              required
                              placeholder="Ex: Prestação de consultoria, taxa de adesão, etc."
                              value={item.description}
                              onChange={(e) =>
                                handleItemChange(idx, 'description', e.target.value)
                              }
                              className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-xs text-slate-900 focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              min="0.1"
                              step="any"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)
                              }
                              className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-xs text-center font-mono text-slate-900 focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)
                              }
                              className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-xs text-right font-mono text-slate-900 focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="any"
                              value={item.discountPercent}
                              onChange={(e) =>
                                handleItemChange(
                                  idx,
                                  'discountPercent',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-xs text-center font-mono text-slate-900 focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <select
                              value={item.taxRate}
                              onChange={(e) =>
                                handleItemChange(idx, 'taxRate', parseFloat(e.target.value) || 0)
                              }
                              className="w-full px-1 py-1.5 border border-slate-200 rounded-md text-xs text-center font-mono text-slate-900 focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="0">0% (Isento)</option>
                              <option value="5">5%</option>
                              <option value="14">14%</option>
                              <option value="23">23%</option>
                            </select>
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                            {formatInvoiceCurrency(item.total, currency)}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Remover linha"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Section 4: Taxes, Withholding and Totals Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
              <div className="lg:col-span-7 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Motivo de Isenção ou Enquadramento Fiscal
                  </label>
                  <input
                    type="text"
                    value={taxExemptionReason}
                    onChange={(e) => setTaxExemptionReason(e.target.value)}
                    placeholder="Ex: Isento nos termos do Artigo 150 da CF/88 ou CIVA"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Termos de Pagamento & Observações Fiscais
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Coordenadas para liquidação, instruções e termos de validade..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
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
                      className="cursor-pointer font-semibold select-none"
                    >
                      Integrar ao Fluxo de Caixa da SMVM
                    </label>
                  </div>
                  <span className="text-[11px] text-blue-700 opacity-90 hidden sm:inline">
                    Lança automaticamente como receita no financeiro
                  </span>
                </div>
              </div>

              {/* Totals card */}
              <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5">
                  Resumo Financeiro da Factura
                </h4>

                <div className="flex justify-between text-xs text-slate-600">
                  <span>Subtotal Bruto:</span>
                  <span className="font-mono">{formatInvoiceCurrency(subtotal, currency)}</span>
                </div>

                {totalDiscount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-700 font-medium">
                    <span>Desconto Concedido:</span>
                    <span className="font-mono">
                      -{formatInvoiceCurrency(totalDiscount, currency)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-xs text-slate-600">
                  <span>Imposto Liquidado (IVA):</span>
                  <span className="font-mono">{formatInvoiceCurrency(totalTax, currency)}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200">
                  <div className="flex items-center gap-1">
                    <span>Retenção na Fonte:</span>
                    <select
                      value={withholdingTaxRate}
                      onChange={(e) => setWithholdingTaxRate(parseFloat(e.target.value) || 0)}
                      className="px-1.5 py-0.5 border border-slate-300 rounded text-[11px] bg-white"
                    >
                      <option value="0">0%</option>
                      <option value="6.5">6.5%</option>
                      <option value="10">10%</option>
                      <option value="15">15%</option>
                    </select>
                  </div>
                  <span className="font-mono text-rose-600">
                    -{formatInvoiceCurrency(withholdingTaxAmount, currency)}
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t-2 border-slate-300 text-slate-900">
                  <span className="text-xs font-extrabold uppercase">Total a Pagar:</span>
                  <span className="text-lg font-black font-mono text-blue-700">
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
