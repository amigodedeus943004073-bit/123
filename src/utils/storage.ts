import {
  Account,
  Category,
  CostCenter,
  Transaction,
  AutomationRule,
  CashFlowPeriodData,
  Invoice,
  InvoiceEmitter,
} from '../types/finance';
import {
  INITIAL_ACCOUNTS,
  INITIAL_CATEGORIES,
  INITIAL_COST_CENTERS,
  INITIAL_TRANSACTIONS,
  INITIAL_AUTOMATIONS,
  INITIAL_INVOICES,
  INITIAL_EMITTER_SETTINGS,
} from '../data/initialData';

const STORAGE_KEYS = {
  ACCOUNTS: 'smvm_finance_accounts_v1',
  CATEGORIES: 'smvm_finance_categories_v1',
  COST_CENTERS: 'smvm_finance_cost_centers_v1',
  TRANSACTIONS: 'smvm_finance_transactions_v1',
  AUTOMATIONS: 'smvm_finance_automations_v1',
  INVOICES: 'smvm_finance_invoices_v1',
  EMITTER_SETTINGS: 'smvm_finance_emitter_settings_v1',
};

export const getSavedAccounts = (): Account[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading accounts from storage', e);
  }
  return INITIAL_ACCOUNTS;
};

export const saveAccounts = (accounts: Account[]) => {
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
};

export const getSavedCategories = (): Category[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading categories from storage', e);
  }
  return INITIAL_CATEGORIES;
};

export const saveCategories = (categories: Category[]) => {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
};

export const getSavedCostCenters = (): CostCenter[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COST_CENTERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading cost centers from storage', e);
  }
  return INITIAL_COST_CENTERS;
};

export const saveCostCenters = (costCenters: CostCenter[]) => {
  localStorage.setItem(STORAGE_KEYS.COST_CENTERS, JSON.stringify(costCenters));
};

export const getSavedTransactions = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading transactions from storage', e);
  }
  return INITIAL_TRANSACTIONS;
};

export const saveTransactions = (transactions: Transaction[]) => {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const getSavedAutomations = (): AutomationRule[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTOMATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading automations from storage', e);
  }
  return INITIAL_AUTOMATIONS;
};

export const saveAutomations = (rules: AutomationRule[]) => {
  localStorage.setItem(STORAGE_KEYS.AUTOMATIONS, JSON.stringify(rules));
};

export const getSavedInvoices = (): Invoice[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading invoices from storage', e);
  }
  return INITIAL_INVOICES;
};

export const saveInvoices = (invoices: Invoice[]) => {
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
};

export const getSavedEmitterSettings = (): InvoiceEmitter => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMITTER_SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading emitter settings from storage', e);
  }
  return INITIAL_EMITTER_SETTINGS;
};

export const saveEmitterSettings = (settings: InvoiceEmitter) => {
  localStorage.setItem(STORAGE_KEYS.EMITTER_SETTINGS, JSON.stringify(settings));
};

export const resetToInitialData = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
  localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  localStorage.removeItem(STORAGE_KEYS.COST_CENTERS);
  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  localStorage.removeItem(STORAGE_KEYS.AUTOMATIONS);
  localStorage.removeItem(STORAGE_KEYS.INVOICES);
  localStorage.removeItem(STORAGE_KEYS.EMITTER_SETTINGS);
};

// Calculate account balance dynamically
export const calculateAccountBalances = (
  accounts: Account[],
  transactions: Transaction[]
): Record<string, number> => {
  const balances: Record<string, number> = {};

  accounts.forEach((acc) => {
    balances[acc.id] = acc.initialBalance;
  });

  transactions.forEach((tx) => {
    if (tx.status !== 'completed') return;

    if (tx.type === 'income') {
      if (balances[tx.accountId] !== undefined) {
        balances[tx.accountId] += tx.amount;
      }
    } else if (tx.type === 'expense') {
      if (balances[tx.accountId] !== undefined) {
        balances[tx.accountId] -= tx.amount;
      }
    } else if (tx.type === 'transfer') {
      if (balances[tx.accountId] !== undefined) {
        balances[tx.accountId] -= tx.amount;
      }
      if (tx.toAccountId && balances[tx.toAccountId] !== undefined) {
        balances[tx.toAccountId] += tx.amount;
      }
    }
  });

  return balances;
};

// Cash flow projection builder
export const computeCashFlowTimeline = (
  transactions: Transaction[],
  initialTotalBalance: number,
  mode: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily'
): CashFlowPeriodData[] => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11

  if (mode === 'daily') {
    // Current month days
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const data: CashFlowPeriodData[] = [];
    let runningBalance = initialTotalBalance;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayLabel = `${String(day).padStart(2, '0')}/${String(currentMonth + 1).padStart(2, '0')}`;

      // Filter transactions for this day
      const dayTx = transactions.filter((t) => t.date.startsWith(dayStr));

      const income = dayTx
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = dayTx
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const net = income - expense;
      runningBalance += net;

      data.push({
        date: dayStr,
        label: dayLabel,
        income,
        expense,
        net,
        accumulatedBalance: runningBalance,
        isProjection: day > today.getDate(),
      });
    }
    return data;
  } else if (mode === 'weekly') {
    // 5 Weeks in the current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const weekRanges = [
      { start: 1, end: 7, label: 'Semana 1 (01-07)' },
      { start: 8, end: 14, label: 'Semana 2 (08-14)' },
      { start: 15, end: 21, label: 'Semana 3 (15-21)' },
      { start: 22, end: 28, label: 'Semana 4 (22-28)' },
      { start: 29, end: daysInMonth, label: `Semana 5 (29-${daysInMonth})` },
    ];

    const data: CashFlowPeriodData[] = [];
    let runningBalance = initialTotalBalance;

    weekRanges.forEach((w) => {
      const startDayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(w.start).padStart(2, '0')}`;
      const endDayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(w.end).padStart(2, '0')}`;

      const weekTx = transactions.filter((t) => {
        const txDate = t.date.substring(0, 10);
        return txDate >= startDayStr && txDate <= endDayStr;
      });

      const income = weekTx
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = weekTx
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const net = income - expense;
      runningBalance += net;

      data.push({
        date: `${startDayStr} / ${endDayStr}`,
        label: w.label,
        income,
        expense,
        net,
        accumulatedBalance: runningBalance,
        isProjection: w.start > today.getDate(),
      });
    });

    return data;
  } else if (mode === 'yearly') {
    // Compare last 3 years + current year + next year
    const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
    const data: CashFlowPeriodData[] = [];
    let runningBalance = initialTotalBalance;

    years.forEach((yr) => {
      const yrPrefix = `${yr}-`;
      const yrTx = transactions.filter((t) => t.date.startsWith(yrPrefix));

      const income = yrTx
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = yrTx
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const net = income - expense;
      runningBalance += net;

      data.push({
        date: `${yr}`,
        label: `Ano ${yr}`,
        income,
        expense,
        net,
        accumulatedBalance: runningBalance,
        isProjection: yr > currentYear,
      });
    });

    return data;
  } else {
    // Monthly (12 months or rolling 8 months)
    const data: CashFlowPeriodData[] = [];
    const now = new Date();
    let runningBalance = initialTotalBalance;

    for (let i = -5; i <= 3; i++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
      const shortMonths = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const label = `${shortMonths[month]}/${String(year).slice(2)}`;

      const monthTx = transactions.filter((t) => t.date.startsWith(monthPrefix));

      const income = monthTx
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTx
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const net = income - expense;
      runningBalance += net;

      data.push({
        date: monthPrefix,
        label,
        income,
        expense,
        net,
        accumulatedBalance: runningBalance,
        isProjection: i > 0,
      });
    }
    return data;
  }
};
