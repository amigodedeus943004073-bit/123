import React from 'react';
import {
  X,
  Printer,
  CheckCircle2,
  Copy,
  Edit,
  Download,
  Building,
  CreditCard,
  FileText,
  AlertCircle,
  MessageCircle,
} from 'lucide-react';
import { Invoice } from '../types/finance';
import {
  formatInvoiceCurrency,
  formatDate,
  getInvoiceTypeLabel,
  getInvoiceStatusLabel,
} from '../utils/formatters';
import { shareViaWhatsApp, formatInvoiceWhatsApp } from '../utils/whatsapp';
import { SMVMLogo } from './SMVMLogo';

interface InvoiceViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onMarkAsPaid: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDuplicate: (invoice: Invoice) => void;
}

export const InvoiceViewerModal: React.FC<InvoiceViewerModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onMarkAsPaid,
  onEdit,
  onDuplicate,
}) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    if (!invoice) return;
    const text = formatInvoiceWhatsApp(invoice, true);
    shareViaWhatsApp(text, invoice.client.phone);
  };

  const isPaid = invoice.status === 'paid';
  const isDraft = invoice.status === 'draft';
  const isCancelled = invoice.status === 'cancelled';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      {/* Container */}
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Action Toolbar (Hidden during print) */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between no-print gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">
              Visualização Oficial:
            </span>
            <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {invoice.invoiceNumber}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                isPaid
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : isDraft
                  ? 'bg-slate-100 text-slate-700 border border-slate-300'
                  : isCancelled
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {getInvoiceStatusLabel(invoice.status)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isPaid && !isCancelled && (
              <button
                onClick={() => onMarkAsPaid(invoice)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                title="Liquidar e registrar entrada no caixa"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Marcar como Paga
              </button>
            )}

            <button
              onClick={() => onDuplicate(invoice)}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Duplicar esta factura"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Duplicar</span>
            </button>

            <button
              onClick={() => onEdit(invoice)}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Editar dados da factura"
            >
              <Edit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Editar</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              title="Compartilhar factura e dados bancários no WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              title="Imprimir ou Salvar como PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / PDF
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-white text-slate-900 font-sans print:p-0 print:overflow-visible">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              {/* Emitter Info */}
              <div className="space-y-1 max-w-sm">
                <div className="flex items-center gap-3">
                  <SMVMLogo size="lg" />
                  <div>
                    <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                      {invoice.emitter.name}
                    </h1>
                    <p className="text-[11px] font-semibold text-slate-500">
                      NIF / CNPJ: <span className="font-mono text-slate-800">{invoice.emitter.taxId}</span>
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 pt-2 leading-relaxed">
                  {invoice.emitter.address} • {invoice.emitter.city}
                  {invoice.emitter.postalCode && ` - CEP ${invoice.emitter.postalCode}`}
                  <br />
                  {invoice.emitter.country}
                </p>
                <p className="text-[11px] text-slate-600">
                  E-mail: <span className="text-slate-800">{invoice.emitter.email}</span> • Tel: {invoice.emitter.phone}
                </p>
                {invoice.emitter.registrationNumber && (
                  <p className="text-[10px] text-slate-400">
                    {invoice.emitter.registrationNumber}
                  </p>
                )}
              </div>

              {/* Invoice Title & Metadata */}
              <div className="text-left sm:text-right space-y-1.5 self-stretch sm:self-auto">
                <div className="inline-block sm:text-right">
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                    {getInvoiceTypeLabel(invoice.type)}
                  </h2>
                  <div className="text-sm font-mono font-extrabold text-blue-700 mt-0.5">
                    Nº {invoice.invoiceNumber}
                  </div>
                </div>

                {/* Status Stamp */}
                <div className="pt-1">
                  <span
                    className={`inline-block text-xs font-black px-3 py-1 rounded border tracking-wider uppercase ${
                      isPaid
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-400'
                        : isCancelled
                        ? 'bg-rose-50 text-rose-700 border-rose-400'
                        : 'bg-amber-50 text-amber-700 border-amber-400'
                    }`}
                  >
                    {isPaid ? 'LIQUIDADA / PAGA' : isDraft ? 'RASCUNHO' : isCancelled ? 'CANCELADA' : 'EMITIDA'}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-0.5 pt-2">
                  <div>
                    <span className="font-medium text-slate-500">Data de Emissão: </span>
                    <strong className="font-mono text-slate-800">{formatDate(invoice.issueDate)}</strong>
                  </div>
                  <div>
                    <span className="font-medium text-slate-500">Data de Vencimento: </span>
                    <strong className="font-mono text-slate-800">{formatDate(invoice.dueDate)}</strong>
                  </div>
                  <div>
                    <span className="font-medium text-slate-500">Moeda: </span>
                    <strong className="font-mono text-slate-800">{invoice.currency}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Client Destination Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
            <div className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-1.5">
              Exmo.(s) Sr.(s) / Destinatário:
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{invoice.client.name}</h3>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                NIF: <span className="font-mono text-slate-900 font-bold">{invoice.client.taxId || 'Consumidor Final'}</span>
              </p>
              {invoice.client.address && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {invoice.client.address}
                  {invoice.client.city && ` - ${invoice.client.city}`}
                </p>
              )}
            </div>
          </div>

          {/* Table of Items */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-xs text-left border border-slate-200">
              <thead className="bg-slate-100 text-slate-800 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Produto / Serviço</th>
                  <th className="py-2.5 px-3 text-center w-24">Quantidade</th>
                  <th className="py-2.5 px-3 text-right w-36">Preço Unitário</th>
                  <th className="py-2.5 px-3 text-right w-40">Valor Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {invoice.items.map((it, idx) => (
                  <tr key={it.id || idx}>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{it.description}</div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                      {it.quantity}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      {formatInvoiceCurrency(it.unitPrice, invoice.currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {formatInvoiceCurrency(it.total, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown & Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 mb-6">
            {/* Legal terms & payment info */}
            <div className="sm:col-span-7 space-y-3">
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 text-xs">
                <span className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  Coordenadas para Pagamento & Transferência:
                </span>
                <p className="text-slate-700">
                  <strong>Banco:</strong> {invoice.emitter.bankName || 'Banco BAI'}
                </p>
                <p className="text-slate-700 font-mono text-[11px] mt-0.5">
                  <strong>IBAN:</strong> {invoice.emitter.ibanOrAccount || 'AO06 0040 0000 8953 6571 101 24'}
                </p>
                <p className="text-slate-700 font-mono text-[11px] mt-0.5">
                  <strong>Para Transferência BAI:</strong> 0040 0000 89536571101 24
                </p>
                <p className="text-slate-700 text-[11px] mt-0.5">
                  <strong>Titular / Beneficiário:</strong> Salomão Muanjita
                </p>
                <p className="text-slate-700 font-mono text-[11px] mt-0.5">
                  <strong>Multicaixa Express:</strong> 943004073
                </p>
              </div>

              {invoice.taxExemptionReason && (
                <div className="text-[11px] text-slate-500 italic bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60">
                  <strong>Enquadramento Fiscal:</strong> {invoice.taxExemptionReason}
                </div>
              )}

              {invoice.notes && (
                <div className="text-[11px] text-slate-600">
                  <strong>Observações:</strong> {invoice.notes}
                </div>
              )}
            </div>

            {/* Totals Table */}
            <div className="sm:col-span-5 border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total dos Produtos:</span>
                <span className="font-mono font-bold text-slate-800">{formatInvoiceCurrency(invoice.subtotal, invoice.currency)}</span>
              </div>

              {invoice.totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Descontos Comerciais:</span>
                  <span className="font-mono">-{formatInvoiceCurrency(invoice.totalDiscount, invoice.currency)}</span>
                </div>
              )}

              {invoice.totalTax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Imposto (IVA):</span>
                  <span className="font-mono">{formatInvoiceCurrency(invoice.totalTax, invoice.currency)}</span>
                </div>
              )}

              {invoice.withholdingTaxAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Retenção na Fonte ({invoice.withholdingTaxRate}%):</span>
                  <span className="font-mono">
                    -{formatInvoiceCurrency(invoice.withholdingTaxAmount, invoice.currency)}
                  </span>
                </div>
              )}

              <div className="border-t-2 border-slate-900 pt-2.5 flex justify-between items-baseline">
                <span className="font-black text-xs uppercase tracking-tight text-slate-900">
                  VALOR TOTAL A PAGAR:
                </span>
                <span className="font-black font-mono text-lg text-blue-700">
                  {formatInvoiceCurrency(invoice.totalAmount, invoice.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer & Certification */}
          <div className="border-t border-slate-200 pt-6 mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-end gap-6 text-[10px] text-slate-400">
              <div>
                <p>Processado por Software de Gestão Financeira Integrada • SMVM</p>
                <p>Documento emitido para efeitos fiscais e comprobatórios da instituição.</p>
              </div>

              <div className="text-center sm:text-right w-48">
                <div className="border-b border-slate-400 pb-1 mb-1"></div>
                <p className="font-semibold text-slate-600">Assinatura & Carimbo</p>
                <p className="text-[9px]">Tesouraria / Gestão SMVM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (No-print) */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 no-print">
          <span>SMVM • Módulo de Facturação Oficial</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
          >
            Fechar Visualização
          </button>
        </div>
      </div>
    </div>
  );
};
