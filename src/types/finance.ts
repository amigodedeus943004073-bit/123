export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionStatus = 'completed' | 'pending' | 'scheduled';
export type PaymentMethod =
  | 'pix'
  | 'boleto'
  | 'transferencia'
  | 'cartao_credito'
  | 'cartao_debito'
  | 'dinheiro'
  | 'outro';

export interface Account {
  id: string;
  name: string;
  type: 'corrente' | 'poupanca' | 'investimento' | 'caixa_fisico';
  bankName: string;
  accountNumber?: string;
  initialBalance: number;
  color: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  iconName: string;
  monthlyBudget?: number;
}

export interface CostCenter {
  id: string;
  name: string;
  code: string;
  manager?: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD
  description: string;
  amount: number;
  type: TransactionType;
  category: string; // category id or name
  accountId: string;
  toAccountId?: string; // for transfers
  costCenterId?: string;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  entityOrRecipient?: string;
  documentNumber?: string;
  notes?: string;
  isRecurring?: boolean;
  recurrenceRuleId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationRule {
  id: string;
  title: string;
  description?: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  accountId: string;
  costCenterId?: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  dayOfMonth: number; // 1 - 31
  active: boolean;
  autoConfirm: boolean;
  nextDueDate: string;
  entityOrRecipient?: string;
  paymentMethod: PaymentMethod;
  lastGeneratedDate?: string;
}

export interface FinancialAlert {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  title: string;
  message: string;
  date: string;
  actionLabel?: string;
  relatedTransactionId?: string;
}

export interface CashFlowPeriodData {
  date: string;
  label: string;
  income: number;
  expense: number;
  net: number;
  accumulatedBalance: number;
  isProjection?: boolean;
}

export type InvoiceType = 'FT' | 'FR' | 'FP' | 'NC'; // Factura, Factura-Recibo, Factura Pró-Forma, Nota de Crédito
export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'cancelled';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // Percent, e.g. 0, 5, 14, 23
  discountPercent: number; // Percent, e.g. 0 to 100
  total: number;
}

export interface InvoiceEmitter {
  name: string;
  taxId: string; // NIF / CNPJ
  address: string;
  city: string;
  postalCode?: string;
  country: string;
  email: string;
  phone: string;
  bankName: string;
  ibanOrAccount: string;
  swiftOrPix?: string;
  registrationNumber?: string;
}

export interface InvoiceClient {
  name: string;
  taxId: string; // NIF / CNPJ / ID Fiscal
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "FT 2026/001"
  type: InvoiceType;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: InvoiceStatus;
  client: InvoiceClient;
  emitter: InvoiceEmitter;
  items: InvoiceItem[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  withholdingTaxRate: number; // Retenção na fonte em % (ex: 0 ou 6.5)
  withholdingTaxAmount: number;
  totalAmount: number;
  currency: string; // 'BRL' | 'EUR' | 'AOA' | 'USD'
  paymentMethod: PaymentMethod;
  notes?: string;
  taxExemptionReason?: string; // e.g., "Isento nos termos da alínea a) do nº 1 do art. 9º do CIVA"
  linkedTransactionId?: string; // id of associated transaction in cash flow
  accountId?: string; // destination account
  costCenterId?: string;
  createdAt: string;
  updatedAt: string;
}
