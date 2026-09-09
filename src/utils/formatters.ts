export const formatCurrency = (amount: number): string => {
  const num = (amount || 0).toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${num} Kz`;
};

export const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr?: string): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })}`;
  } catch {
    return dateStr;
  }
};

export const getMonthName = (monthIndex: number): string => {
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  return months[monthIndex] || '';
};

export const getShortMonthName = (monthIndex: number): string => {
  const months = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];
  return months[monthIndex] || '';
};

export const formatPercentage = (val: number): string => {
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}%`;
};

export const formatInvoiceCurrency = (amount: number, currency: string = 'AOA'): string => {
  const cleanCurrency = (!currency || currency.toUpperCase() === 'BRL') ? 'AOA' : currency.toUpperCase();
  const num = (amount || 0).toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (cleanCurrency === 'AOA' || cleanCurrency === 'KZ') {
    return `${num} Kz`;
  }
  return `${cleanCurrency} ${num}`;
};

export const getInvoiceTypeLabel = (type: string): string => {
  switch (type) {
    case 'FT':
      return 'Factura';
    case 'FR':
      return 'Factura-Recibo';
    case 'FP':
      return 'Factura Pró-Forma';
    case 'NC':
      return 'Nota de Crédito';
    default:
      return type;
  }
};

export const getInvoiceStatusLabel = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'Rascunho';
    case 'issued':
      return 'Emitida';
    case 'paid':
      return 'Paga / Liquidada';
    case 'cancelled':
      return 'Cancelada';
    default:
      return status;
  }
};
