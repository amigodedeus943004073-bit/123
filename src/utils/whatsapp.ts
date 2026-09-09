import { formatCurrency, formatDate } from './formatters';
import { BiblicalVerse, getVerseOfTheDay } from '../data/biblicalVerses';
import { Invoice } from '../types/finance';

/**
 * Opens WhatsApp with the given pre-formatted text.
 * Falls back gracefully to standard web link.
 */
export const shareViaWhatsApp = (message: string, phoneNumber?: string) => {
  const cleanPhone = phoneNumber ? phoneNumber.replace(/\D/g, '') : '';
  const encodedText = encodeURIComponent(message);
  
  const url = cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;

  // Try opening in a new window/tab
  const win = window.open(url, '_blank');
  if (!win || win.closed || typeof win.closed === 'undefined') {
    // Fallback if popup blocked
    window.location.href = url;
  }
};

/**
 * Builds a formatted WhatsApp message for financial reports (Daily, Weekly, Monthly, Annual)
 */
export const formatFinancialReportWhatsApp = ({
  periodType,
  periodLabel,
  income,
  expense,
  net,
  accumulatedBalance,
  pendingCount,
  topCategory,
  includeVerse = true,
  customVerse,
}: {
  periodType: 'diario' | 'semanal' | 'mensal' | 'anual' | 'geral';
  periodLabel: string;
  income: number;
  expense: number;
  net: number;
  accumulatedBalance?: number;
  pendingCount?: number;
  topCategory?: string;
  includeVerse?: boolean;
  customVerse?: BiblicalVerse;
}): string => {
  const periodTitles: Record<string, string> = {
    diario: '📅 Relatório Diário de Fluxo de Caixa',
    semanal: '📊 Relatório Semanal de Fluxo de Caixa',
    mensal: '📑 Relatório Mensal Consolidado',
    anual: '🏛️ Relatório Financeiro Anual',
    geral: '📈 Demonstrativo Financeiro SMVM',
  };

  const title = periodTitles[periodType] || '📈 Relatório Financeiro SMVM';
  const verse = customVerse || getVerseOfTheDay();
  const netSign = net >= 0 ? '🟢 Superávit:' : '🔴 Déficit:';

  let msg = `*SMVM - GESTÃO FINANCEIRA*\n`;
  msg += `_${title}_\n`;
  msg += `🗓️ *Período:* ${periodLabel}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  msg += `💰 *RESUMO DO FLUXO DE CAIXA:*\n`;
  msg += `📥 *Entradas:* ${formatCurrency(income)}\n`;
  msg += `📤 *Saídas:* ${formatCurrency(expense)}\n`;
  msg += `${netSign} *${formatCurrency(net)}*\n`;

  if (accumulatedBalance !== undefined) {
    msg += `🏦 *Saldo em Caixa:* ${formatCurrency(accumulatedBalance)}\n`;
  }

  if (pendingCount && pendingCount > 0) {
    msg += `⏳ *Contas Pendentes:* ${pendingCount}\n`;
  }

  if (topCategory) {
    msg += `🏷️ *Maior Movimentação:* ${topCategory}\n`;
  }

  msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;

  if (includeVerse && verse) {
    msg += `📖 *VERSÍCULO DE MORDOMIA & SABEDORIA:*\n`;
    msg += `_"${verse.text}"_\n`;
    msg += `*${verse.reference}*\n`;
    msg += `💡 _Princípio: ${verse.financialPrinciple}_\n\n`;
  }

  msg += `_Emitido via Sistema Integrado SMVM em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}._`;

  return msg;
};

/**
 * Builds a formatted WhatsApp message for an Invoice
 */
export const formatInvoiceWhatsApp = (
  invoice: Invoice,
  includeVerse = true
): string => {
  const verse = getVerseOfTheDay();
  const docNames: Record<string, string> = {
    FT: 'Factura',
    FR: 'Factura-Recibo',
    FP: 'Factura Pró-Forma',
    NC: 'Nota de Crédito',
  };

  const docTitle = docNames[invoice.type] || 'Factura';

  let msg = `*${invoice.emitter.name || 'SMVM'}*\n`;
  msg += `📄 *DOCUMENTO OFICIAL: ${docTitle.toUpperCase()} Nº ${invoice.invoiceNumber}*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  msg += `👤 *Destinatário:* ${invoice.client.name}\n`;
  if (invoice.client.taxId) {
    msg += `🆔 *NIF / CNPJ:* ${invoice.client.taxId}\n`;
  }
  msg += `📅 *Data de Emissão:* ${formatDate(invoice.issueDate)}\n`;
  msg += `⏰ *Vencimento:* ${formatDate(invoice.dueDate)}\n`;
  msg += `💳 *Estado:* ${invoice.status === 'paid' ? '✅ Liquidada / Paga' : '⏳ Aguardando Pagamento'}\n\n`;

  msg += `📋 *ITENS / SERVIÇOS:*\n`;
  invoice.items.forEach((item, idx) => {
    msg += ` ${idx + 1}. ${item.description} (${item.quantity}x) — ${formatCurrency(item.total)}\n`;
  });

  msg += `\n💵 *TOTAL A PAGAR: ${formatCurrency(invoice.totalAmount)}*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;

  if (invoice.emitter.bankName || invoice.emitter.ibanOrAccount || invoice.emitter.swiftOrPix) {
    msg += `\n🏦 *DADOS PARA TRANSFERÊNCIA & PAGAMENTO:*\n`;
    if (invoice.emitter.bankName) msg += `• Banco: ${invoice.emitter.bankName}\n`;
    if (invoice.emitter.ibanOrAccount) msg += `• IBAN: ${invoice.emitter.ibanOrAccount}\n`;
    msg += `• Para Transferência BAI: 0040 0000 89536571101 24\n`;
    msg += `• Titular: Salomão Muanjita\n`;
    msg += `• Multicaixa Express: 943004073\n`;
  }

  if (includeVerse && verse) {
    msg += `\n📖 _"${verse.text}"_ — *${verse.reference}*\n`;
  }

  msg += `\n_Agradecemos pela parceria e compromisso com nossa missão!_`;

  return msg;
};

/**
 * Builds a formatted WhatsApp message for sharing a financial verse
 */
export const formatVerseWhatsApp = (verse: BiblicalVerse): string => {
  let msg = `*MOMENTO DE SABEDORIA FINANCEIRA & MORDOMIA*\n`;
  msg += `_Sociedade Missionária Vida & Missão (SMVM)_\n\n`;
  msg += `📖 *"${verse.text}"*\n`;
  msg += `🔖 *${verse.reference}* [${verse.theme}]\n\n`;
  msg += `💡 *Princípio Prático:* ${verse.financialPrinciple}\n\n`;
  msg += `_"Quem administra com fidelidade o pouco, sobre o muito será colocado." (Lucas 16:10)_`;
  return msg;
};
