import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getSavedAccounts,
  saveAccounts,
  getSavedCategories,
  saveCategories,
  getSavedCostCenters,
  saveCostCenters,
  getSavedTransactions,
  saveTransactions,
  getSavedAutomations,
  saveAutomations,
  getSavedInvoices,
  saveInvoices,
  getSavedEmitterSettings,
  saveEmitterSettings,
  resetToInitialData,
  calculateAccountBalances,
  computeCashFlowTimeline,
} from './utils/storage';
import {
  Account,
  Category,
  CostCenter,
  Transaction,
  AutomationRule,
  FinancialAlert,
  Invoice,
  InvoiceEmitter,
} from './types/finance';
import { Header } from './components/Header';
import { MetricsOverview } from './components/MetricsOverview';
import { CashFlowChart } from './components/CashFlowChart';
import { CategoryDistribution } from './components/CategoryDistribution';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { AutomationModal } from './components/AutomationModal';
import { AccountsManagerModal } from './components/AccountsManagerModal';
import { DetailedReportsModal } from './components/DetailedReportsModal';
import { AlertsModal } from './components/AlertsModal';
import { BackupModal } from './components/BackupModal';
import { InvoicesManagerModal } from './components/InvoicesManagerModal';
import { InvoiceModal } from './components/InvoiceModal';
import { InvoiceViewerModal } from './components/InvoiceViewerModal';
import { BiblicalStewardshipBanner } from './components/BiblicalStewardshipBanner';
import { INITIAL_TRANSACTIONS } from './data/initialData';
import { getMonthName, formatCurrency } from './utils/formatters';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Receipt,
  BarChart3,
  BookOpen,
  Wallet,
  FolderOpen,
  ListFilter,
  Maximize2,
} from 'lucide-react';

export default function App() {
  // Primary financial state
  const [accounts, setAccounts] = useState<Account[]>(getSavedAccounts);
  const [categories, setCategories] = useState<Category[]>(getSavedCategories);
  const [costCenters, setCostCenters] = useState<CostCenter[]>(getSavedCostCenters);
  const [transactions, setTransactions] = useState<Transaction[]>(getSavedTransactions);
  const [automations, setAutomations] = useState<AutomationRule[]>(getSavedAutomations);
  const [invoices, setInvoices] = useState<Invoice[]>(getSavedInvoices);
  const [emitterSettings, setEmitterSettings] = useState<InvoiceEmitter>(getSavedEmitterSettings);

  // Modal open states
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isAutomationsOpen, setIsAutomationsOpen] = useState(false);
  const [isAccountsOpen, setIsAccountsOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isBiblicalModalOpen, setIsBiblicalModalOpen] = useState(false);

  // Invoice modal states
  const [isInvoicesManagerOpen, setIsInvoicesManagerOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isInvoiceViewerOpen, setIsInvoiceViewerOpen] = useState(false);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<Invoice | null>(null);
  const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState<Invoice | null>(null);

  // Feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync to localStorage
  useEffect(() => {
    saveAccounts(accounts);
  }, [accounts]);

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveCostCenters(costCenters);
  }, [costCenters]);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveAutomations(automations);
  }, [automations]);

  useEffect(() => {
    saveInvoices(invoices);
  }, [invoices]);

  useEffect(() => {
    saveEmitterSettings(emitterSettings);
  }, [emitterSettings]);

  const pendingInvoicesCount = useMemo(() => {
    return invoices.filter((i) => i.status === 'issued').length;
  }, [invoices]);

  // Dynamically calculated balances
  const balances = useMemo(() => {
    return calculateAccountBalances(accounts, transactions);
  }, [accounts, transactions]);

  // Total consolidated balance across all accounts
  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + (balances[acc.id] ?? acc.initialBalance), 0);
  }, [accounts, balances]);

  // Current month transactions breakdown
  const today = new Date();
  const currentMonthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthName = getMonthName(today.getMonth());

  const currentMonthTx = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(currentMonthPrefix));
  }, [transactions, currentMonthPrefix]);

  const completedIncome = useMemo(() => {
    return currentMonthTx
      .filter((t) => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTx]);

  const pendingIncome = useMemo(() => {
    return currentMonthTx
      .filter((t) => t.type === 'income' && t.status !== 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTx]);

  const completedExpense = useMemo(() => {
    return currentMonthTx
      .filter((t) => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTx]);

  const pendingExpense = useMemo(() => {
    return currentMonthTx
      .filter((t) => t.type === 'expense' && t.status !== 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTx]);

  const netResult = completedIncome - completedExpense;

  // Reserve balance (accounts marked as 'investimento' or description containing reserva)
  const reserveAmount = useMemo(() => {
    return accounts
      .filter((a) => a.type === 'investimento' || a.name.toLowerCase().includes('reserva'))
      .reduce((sum, a) => sum + (balances[a.id] ?? a.initialBalance), 0);
  }, [accounts, balances]);

  // Projected 30-day balance
  const projectedBalance30Days = useMemo(() => {
    // Current total balance + all pending and scheduled transactions in next 30 days
    const next30Days = new Date();
    next30Days.setDate(next30Days.getDate() + 30);
    const limitDate = next30Days.toISOString().split('T')[0];

    let projected = totalBalance;
    transactions.forEach((t) => {
      if (t.status !== 'completed' && t.date <= limitDate) {
        if (t.type === 'income') projected += t.amount;
        if (t.type === 'expense') projected -= t.amount;
      }
    });
    return projected;
  }, [totalBalance, transactions]);

  // Chart data timelines (Daily, Weekly, Monthly, Yearly)
  const dailyChartData = useMemo(() => {
    return computeCashFlowTimeline(transactions, totalBalance, 'daily');
  }, [transactions, totalBalance]);

  const weeklyChartData = useMemo(() => {
    return computeCashFlowTimeline(transactions, totalBalance, 'weekly');
  }, [transactions, totalBalance]);

  const monthlyChartData = useMemo(() => {
    return computeCashFlowTimeline(transactions, totalBalance, 'monthly');
  }, [transactions, totalBalance]);

  const yearlyChartData = useMemo(() => {
    return computeCashFlowTimeline(transactions, totalBalance, 'yearly');
  }, [transactions, totalBalance]);

  // Financial Diagnostics / Real-Time Alerts
  const alerts = useMemo(() => {
    const list: FinancialAlert[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // Check overdue bills
    const overdueExpenses = transactions.filter(
      (t) => t.type === 'expense' && t.status !== 'completed' && (t.dueDate || t.date) < todayStr
    );
    if (overdueExpenses.length > 0) {
      const totalOverdue = overdueExpenses.reduce((s, t) => s + t.amount, 0);
      list.push({
        id: 'al-overdue',
        type: 'danger',
        title: `${overdueExpenses.length} despesa(s) vencida(s)`,
        message: `Existem pagamentos pendentes que já passaram da data limite totalizando ${formatCurrency(
          totalOverdue
        )}.`,
        date: todayStr,
      });
    }

    // Check bills due today
    const dueToday = transactions.filter(
      (t) => t.status !== 'completed' && (t.dueDate || t.date) === todayStr
    );
    if (dueToday.length > 0) {
      list.push({
        id: 'al-today',
        type: 'warning',
        title: `${dueToday.length} conta(s) vencendo hoje`,
        message: 'Verifique a tesouraria e aprove as baixas bancárias programadas para a data atual.',
        date: todayStr,
      });
    }

    // Check categories exceeding monthly budget
    categories.forEach((cat) => {
      if (cat.type === 'expense' && cat.monthlyBudget && cat.monthlyBudget > 0) {
        const spent = currentMonthTx
          .filter((t) => (t.category === cat.id || t.category === cat.name) && t.status === 'completed')
          .reduce((s, t) => s + t.amount, 0);
        if (spent > cat.monthlyBudget) {
          list.push({
            id: `al-cat-${cat.id}`,
            type: 'warning',
            title: `Orçamento ultrapassado: ${cat.name}`,
            message: `Despesas em "${cat.name}" atingiram ${formatCurrency(spent)}, ultrapassando o teto orçado de ${formatCurrency(
              cat.monthlyBudget
            )}.`,
            date: todayStr,
          });
        }
      }
    });

    return list;
  }, [transactions, categories, currentMonthTx]);

  const pendingList = useMemo(() => {
    return transactions
      .filter((t) => t.status !== 'completed')
      .sort((a, b) => (a.dueDate || a.date).localeCompare(b.dueDate || b.date));
  }, [transactions]);

  // Execute automation rules: generate transactions if due
  const handleExecuteAutomations = useCallback(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    let generatedCount = 0;

    const newTransactions: Transaction[] = [...transactions];

    automations.forEach((rule) => {
      if (!rule.active) return;

      const dateStr = `${currentYearMonth}-${String(rule.dayOfMonth).padStart(2, '0')}`;
      // Check if already created for this month and rule
      const exists = newTransactions.some(
        (tx) => tx.recurrenceRuleId === rule.id && tx.date.startsWith(currentYearMonth)
      );

      if (!exists) {
        generatedCount++;
        const newTx: Transaction = {
          id: `tx-auto-${rule.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          date: dateStr,
          dueDate: dateStr,
          description: `[Auto] ${rule.title}`,
          amount: rule.amount,
          type: rule.type,
          category: rule.category,
          accountId: rule.accountId,
          costCenterId: rule.costCenterId,
          status: rule.autoConfirm && currentDay >= rule.dayOfMonth ? 'completed' : 'pending',
          paymentMethod: rule.paymentMethod || 'pix',
          entityOrRecipient: rule.entityOrRecipient,
          recurrenceRuleId: rule.id,
          isRecurring: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        newTransactions.push(newTx);
      }
    });

    if (generatedCount > 0) {
      setTransactions(newTransactions);
      showToast(`${generatedCount} lançamento(s) provisionado(s) automaticamente pelo motor de recorrência!`);
    } else {
      showToast('Todas as regras recorrentes do mês já foram provisionadas no fluxo.');
    }
  }, [automations, transactions]);

  // Save / Update transaction
  const handleSaveTransaction = (txData: Partial<Transaction>) => {
    if (txData.id) {
      // Update
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === txData.id
            ? {
                ...t,
                ...(txData as Transaction),
                updatedAt: new Date().toISOString(),
              }
            : t
        )
      );
      showToast('Lançamento atualizado com sucesso!');
    } else {
      // Create
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        date: txData.date || new Date().toISOString().split('T')[0],
        dueDate: txData.dueDate || txData.date,
        description: txData.description || 'Lançamento SMVM',
        amount: txData.amount || 0,
        type: txData.type || 'expense',
        category: txData.category || categories[0]?.id || 'Geral',
        accountId: txData.accountId || accounts[0]?.id,
        toAccountId: txData.toAccountId,
        costCenterId: txData.costCenterId,
        status: txData.status || 'completed',
        paymentMethod: txData.paymentMethod || 'pix',
        entityOrRecipient: txData.entityOrRecipient,
        documentNumber: txData.documentNumber,
        notes: txData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTransactions((prev) => [newTx, ...prev]);
      showToast('Novo lançamento registrado no fluxo de caixa!');
    }
    setEditingTransaction(null);
  };

  // 1-Click status toggle (conciliação rápida)
  const handleToggleStatus = (tx: Transaction) => {
    const nextStatus = tx.status === 'completed' ? 'pending' : 'completed';
    setTransactions((prev) =>
      prev.map((t) => (t.id === tx.id ? { ...t, status: nextStatus, updatedAt: new Date().toISOString() } : t))
    );
    showToast(
      nextStatus === 'completed'
        ? `Lançamento "${tx.description}" efetivado com sucesso!`
        : `Lançamento marcado como pendente.`
    );
  };

  // Delete transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveTransactions(next);
      return next;
    });
    showToast('Transação excluída do fluxo.');
  };

  // Duplicate transaction
  const handleDuplicateTransaction = (tx: Transaction) => {
    const duplicated: Transaction = {
      ...tx,
      id: `tx-dup-${Date.now()}`,
      description: `${tx.description} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTransactions((prev) => [duplicated, ...prev]);
    showToast('Lançamento duplicado com sucesso!');
  };

  // Transfer between accounts
  const handleTransferBetweenAccounts = (
    fromId: string,
    toId: string,
    amount: number,
    description: string
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const transferTx: Transaction = {
      id: `tx-tr-${Date.now()}`,
      date: todayStr,
      dueDate: todayStr,
      description: description || 'Transferência entre contas SMVM',
      amount,
      type: 'transfer',
      category: 'cat-inc-4',
      accountId: fromId,
      toAccountId: toId,
      status: 'completed',
      paymentMethod: 'transferencia',
      entityOrRecipient: 'Tesouraria SMVM',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTransactions((prev) => [transferTx, ...prev]);
    showToast(`Transferência de ${formatCurrency(amount)} realizada com sucesso!`);
  };

  // Reset to default
  const handleResetData = () => {
    resetToInitialData();
    setAccounts(getSavedAccounts());
    setCategories(getSavedCategories());
    setCostCenters(getSavedCostCenters());
    setTransactions(getSavedTransactions());
    setAutomations(getSavedAutomations());
    setInvoices(getSavedInvoices());
    setEmitterSettings(getSavedEmitterSettings());
    showToast('Dados restaurados para o padrão com sucesso!');
  };

  // Invoice Handlers
  const handleSaveInvoice = (newInvoice: Invoice, syncToCashFlow: boolean) => {
    let linkedTxId = newInvoice.linkedTransactionId;

    if (syncToCashFlow) {
      if (linkedTxId) {
        // Update existing transaction
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === linkedTxId
              ? {
                  ...t,
                  date: newInvoice.issueDate,
                  dueDate: newInvoice.dueDate,
                  description: `[Factura ${newInvoice.invoiceNumber}] ${newInvoice.client.name}`,
                  amount: newInvoice.totalAmount,
                  type: newInvoice.type === 'NC' ? 'expense' : 'income',
                  status: newInvoice.status === 'paid' ? 'completed' : 'pending',
                  paymentMethod: newInvoice.paymentMethod || 'pix',
                  entityOrRecipient: newInvoice.client.name,
                  documentNumber: newInvoice.invoiceNumber,
                  accountId: newInvoice.accountId || t.accountId,
                  costCenterId: newInvoice.costCenterId || t.costCenterId,
                  updatedAt: new Date().toISOString(),
                }
              : t
          )
        );
      } else {
        // Create new transaction for cash flow
        const newTxId = `tx-inv-${Date.now()}`;
        linkedTxId = newTxId;
        newInvoice.linkedTransactionId = newTxId;

        const syncTx: Transaction = {
          id: newTxId,
          date: newInvoice.issueDate,
          dueDate: newInvoice.dueDate,
          description: `[Factura ${newInvoice.invoiceNumber}] ${newInvoice.client.name}`,
          amount: newInvoice.totalAmount,
          type: newInvoice.type === 'NC' ? 'expense' : 'income',
          category: 'cat-inc-1',
          accountId: newInvoice.accountId || accounts[0]?.id,
          costCenterId: newInvoice.costCenterId || costCenters[0]?.id,
          status: newInvoice.status === 'paid' ? 'completed' : 'pending',
          paymentMethod: newInvoice.paymentMethod || 'pix',
          entityOrRecipient: newInvoice.client.name,
          documentNumber: newInvoice.invoiceNumber,
          notes: `Lançamento gerado a partir da factura ${newInvoice.invoiceNumber}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setTransactions((prev) => [syncTx, ...prev]);
      }
    }

    setInvoices((prev) => {
      const exists = prev.some((i) => i.id === newInvoice.id);
      if (exists) {
        return prev.map((i) => (i.id === newInvoice.id ? newInvoice : i));
      }
      return [newInvoice, ...prev];
    });

    if (selectedInvoiceForView?.id === newInvoice.id) {
      setSelectedInvoiceForView(newInvoice);
    }

    showToast(`Factura "${newInvoice.invoiceNumber}" salva e processada com sucesso!`);
    setIsInvoiceModalOpen(false);
    setSelectedInvoiceForEdit(null);
  };

  const handleMarkInvoiceAsPaid = (invoice: Invoice) => {
    const updatedInvoice: Invoice = {
      ...invoice,
      status: 'paid',
      updatedAt: new Date().toISOString(),
    };

    setInvoices((prev) =>
      prev.map((i) => (i.id === invoice.id ? updatedInvoice : i))
    );

    if (selectedInvoiceForView?.id === invoice.id) {
      setSelectedInvoiceForView(updatedInvoice);
    }

    // Update or create linked transaction
    if (invoice.linkedTransactionId) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === invoice.linkedTransactionId
            ? { ...t, status: 'completed', updatedAt: new Date().toISOString() }
            : t
        )
      );
    } else {
      const newTx: Transaction = {
        id: `tx-inv-paid-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        dueDate: invoice.dueDate,
        description: `[Factura ${invoice.invoiceNumber}] ${invoice.client.name}`,
        amount: invoice.totalAmount,
        type: invoice.type === 'NC' ? 'expense' : 'income',
        category: 'cat-inc-1',
        accountId: invoice.accountId || accounts[0]?.id,
        costCenterId: invoice.costCenterId || costCenters[0]?.id,
        status: 'completed',
        paymentMethod: invoice.paymentMethod || 'pix',
        entityOrRecipient: invoice.client.name,
        documentNumber: invoice.invoiceNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTransactions((prev) => [newTx, ...prev]);
    }

    showToast(`Factura ${invoice.invoiceNumber} liquidada e registrada no fluxo de caixa!`);
  };

  const handleDuplicateInvoice = (invoice: Invoice) => {
    const nextSeq = String(invoices.length + 1).padStart(3, '0');
    const currentYear = new Date().getFullYear();

    const duplicated: Invoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
      invoiceNumber: `FT ${currentYear}/${nextSeq}`,
      issueDate: new Date().toISOString().split('T')[0],
      status: 'draft',
      linkedTransactionId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSelectedInvoiceForEdit(duplicated);
    setIsInvoiceModalOpen(true);
    showToast(`Factura duplicada como rascunho: ${duplicated.invoiceNumber}`);
  };

  const handleDeleteInvoice = (id: string) => {
    const target = invoices.find((i) => i.id === id);
    if (!target) return;

    if (
      window.confirm(
        `Tem certeza que deseja remover a factura ${target.invoiceNumber}? Os lançamentos vinculados no caixa não serão excluídos automaticamente.`
      )
    ) {
      setInvoices((prev) => prev.filter((i) => i.id !== id));
      if (selectedInvoiceForView?.id === id) {
        setIsInvoiceViewerOpen(false);
        setSelectedInvoiceForView(null);
      }
      showToast(`Factura ${target.invoiceNumber} removida.`);
    }
  };

  const handleSaveEmitterSettings = (settings: InvoiceEmitter) => {
    setEmitterSettings(settings);
    showToast('Dados da entidade emissora (SMVM) atualizados!');
  };

  const handleClearAllTransactions = (zeroAccountBalances = false) => {
    setTransactions([]);
    saveTransactions([]);
    if (zeroAccountBalances) {
      setAccounts((prev) => {
        const updated = prev.map((acc) => ({ ...acc, initialBalance: 0 }));
        saveAccounts(updated);
        return updated;
      });
      showToast('Lançamentos limpos e saldos zerados com sucesso (R$ 0,00)!');
    } else {
      showToast('Todos os lançamentos foram limpos. Caixa pronto para novos registros!');
    }
  };

  const handleRestoreDemoTransactions = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    saveTransactions(INITIAL_TRANSACTIONS);
    showToast('Lançamentos de demonstração restaurados com sucesso!');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white pb-16">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        totalBalance={totalBalance}
        onNewTransaction={() => {
          setEditingTransaction(null);
          setIsTxModalOpen(true);
        }}
        onOpenAutomations={() => setIsAutomationsOpen(true)}
        onOpenAccounts={() => setIsAccountsOpen(true)}
        onOpenReports={() => setIsReportsOpen(true)}
        onOpenInvoices={() => setIsInvoicesManagerOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onTriggerSync={() => {
          handleExecuteAutomations();
          showToast('Sincronização em tempo real e conciliação recalculadas!');
        }}
        alertCount={alerts.length}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        pendingInvoicesCount={pendingInvoicesCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-5">
        {/* Real-time Automation Announcement Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight text-white">
                  Automação & Emissão de Facturas SMVM
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Tempo Real
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {automations.filter((a) => a.active).length} regras de recorrência • Emissão de Facturas oficiais e integração direta com o fluxo de caixa.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              id="btn-banner-new-invoice"
              onClick={() => {
                setSelectedInvoiceForEdit(null);
                setIsInvoiceModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Receipt className="w-3.5 h-3.5" />
              Emitir Factura
            </button>
            <button
              id="btn-banner-automations"
              onClick={() => setIsAutomationsOpen(true)}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold border border-white/20 transition-colors flex items-center gap-1.5"
            >
              Ver Regras
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-banner-exec"
              onClick={handleExecuteAutomations}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-sm"
            >
              Executar Recorrências
            </button>
          </div>
        </div>

        {/* 4 Core Financial KPI Metrics */}
        <MetricsOverview
          totalBalance={totalBalance}
          completedIncome={completedIncome}
          pendingIncome={pendingIncome}
          completedExpense={completedExpense}
          pendingExpense={pendingExpense}
          netResult={netResult}
          projectedBalance30Days={projectedBalance30Days}
          activeAccountsCount={accounts.length}
          reserveAmount={reserveAmount}
          monthName={currentMonthName}
        />

        {/* Biblical Stewardship & Finance Wisdom Banner */}
        <BiblicalStewardshipBanner
          isOpenModal={isBiblicalModalOpen}
          onCloseModal={() => setIsBiblicalModalOpen(false)}
        />

        {/* Central de Acesso Rápido • Abrir Tudo */}
        <div id="quick-access-hub" className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Acesso Rápido • Abrir Tudo
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                  Painel de Módulos
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Abra instantaneamente relatórios detalhados, extratos, facturas e tesouraria
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-quick-reports"
              type="button"
              onClick={() => setIsReportsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              title="Abrir relatórios financeiros com periodicidades Diário, Semanal, Mensal e Anual"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Abrir Relatórios (Diário/Semanal/Mensal/Anual)</span>
            </button>

            <button
              id="btn-quick-verses"
              type="button"
              onClick={() => setIsBiblicalModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold shadow-xs transition-colors"
              title="Abrir coletânea bíblica de sabedoria e mordomia financeira"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span>Abrir Versículos Bíblicos</span>
            </button>

            <button
              id="btn-quick-invoices"
              type="button"
              onClick={() => setIsInvoicesManagerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold shadow-xs transition-colors"
              title="Abrir emissor e gerenciador de facturas"
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-700" />
              <span>Abrir Facturas</span>
            </button>

            <button
              id="btn-quick-accounts"
              type="button"
              onClick={() => setIsAccountsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-xl text-xs font-bold shadow-xs transition-colors"
              title="Abrir contas bancárias e saldos"
            >
              <Wallet className="w-3.5 h-3.5 text-blue-700" />
              <span>Abrir Contas</span>
            </button>

            <button
              id="btn-quick-automations"
              type="button"
              onClick={() => setIsAutomationsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 rounded-xl text-xs font-bold shadow-xs transition-colors"
              title="Abrir regras de automação financeira"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-700" />
              <span>Abrir Automações</span>
            </button>
            <button
              id="btn-quick-extract"
              type="button"
              onClick={() => {
                document.getElementById('transactions-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold shadow-xs transition-colors"
              title="Rolar para o extrato de lançamentos"
            >
              <ListFilter className="w-3.5 h-3.5 text-slate-600" />
              <span>Abrir Extrato</span>
            </button>
          </div>
        </div>

        {/* Real-time Charts Row: Cash Flow History & Projections + Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 xl:col-span-8">
            <CashFlowChart
              dailyData={dailyChartData}
              weeklyData={weeklyChartData}
              monthlyData={monthlyChartData}
              yearlyData={yearlyChartData}
            />
          </div>
          <div className="lg:col-span-5 xl:col-span-4">
            <CategoryDistribution
              categories={categories}
              transactions={transactions}
              costCenters={costCenters}
            />
          </div>
        </div>

        {/* Interactive Cash Flow Transactions List */}
        <div id="transactions-section">
          <TransactionList
            transactions={transactions}
            accounts={accounts}
            categories={categories}
            costCenters={costCenters}
            onNewTransaction={() => {
              setEditingTransaction(null);
              setIsTxModalOpen(true);
            }}
            onEditTransaction={(tx) => {
              setEditingTransaction(tx);
              setIsTxModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            onDuplicateTransaction={handleDuplicateTransaction}
            onToggleStatus={handleToggleStatus}
            onClearAllTransactions={handleClearAllTransactions}
            onRestoreDemoTransactions={handleRestoreDemoTransactions}
          />
        </div>
      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        accounts={accounts}
        categories={categories}
        costCenters={costCenters}
        editingTransaction={editingTransaction}
      />

      <AutomationModal
        isOpen={isAutomationsOpen}
        onClose={() => setIsAutomationsOpen(false)}
        automations={automations}
        onSaveAutomation={(rule) => {
          setAutomations((prev) => [rule, ...prev]);
          showToast('Nova regra de automação salva!');
        }}
        onDeleteAutomation={(id) => {
          setAutomations((prev) => prev.filter((r) => r.id !== id));
          showToast('Regra excluída.');
        }}
        onToggleAutomation={(id) => {
          setAutomations((prev) =>
            prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
          );
        }}
        onExecuteAutomationsNow={handleExecuteAutomations}
        accounts={accounts}
        categories={categories}
        costCenters={costCenters}
      />

      <AccountsManagerModal
        isOpen={isAccountsOpen}
        onClose={() => setIsAccountsOpen(false)}
        accounts={accounts}
        balances={balances}
        onSaveAccount={(newAcc) => {
          setAccounts((prev) => [...prev, newAcc]);
          showToast(`Conta "${newAcc.name}" cadastrada!`);
        }}
        onTransfer={handleTransferBetweenAccounts}
      />

      <DetailedReportsModal
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
        transactions={transactions}
        accounts={accounts}
        categories={categories}
        costCenters={costCenters}
        totalBalance={totalBalance}
      />

      <AlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
        pendingTransactions={pendingList}
        onQuickPay={handleToggleStatus}
      />

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        accounts={accounts}
        categories={categories}
        costCenters={costCenters}
        transactions={transactions}
        automations={automations}
        invoices={invoices}
        emitterSettings={emitterSettings}
        onImportData={(data) => {
          if (data.accounts) setAccounts(data.accounts);
          if (data.categories) setCategories(data.categories);
          if (data.costCenters) setCostCenters(data.costCenters);
          if (data.transactions) setTransactions(data.transactions);
          if (data.automations) setAutomations(data.automations);
          if (data.invoices) setInvoices(data.invoices);
          if (data.emitterSettings) setEmitterSettings(data.emitterSettings);
          showToast('Backup importado com sucesso!');
        }}
        onResetData={handleResetData}
        onClearTransactions={handleClearAllTransactions}
      />

      {/* Invoice Management Modals */}
      <InvoicesManagerModal
        isOpen={isInvoicesManagerOpen}
        onClose={() => setIsInvoicesManagerOpen(false)}
        invoices={invoices}
        emitterSettings={emitterSettings}
        accounts={accounts}
        costCenters={costCenters}
        onOpenNewInvoice={() => {
          setSelectedInvoiceForEdit(null);
          setIsInvoiceModalOpen(true);
        }}
        onViewInvoice={(inv) => {
          setSelectedInvoiceForView(inv);
          setIsInvoiceViewerOpen(true);
        }}
        onEditInvoice={(inv) => {
          setSelectedInvoiceForEdit(inv);
          setIsInvoiceModalOpen(true);
        }}
        onDuplicateInvoice={handleDuplicateInvoice}
        onDeleteInvoice={handleDeleteInvoice}
        onMarkAsPaid={handleMarkInvoiceAsPaid}
        onSaveEmitterSettings={handleSaveEmitterSettings}
      />

      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedInvoiceForEdit(null);
        }}
        onSaveInvoice={handleSaveInvoice}
        emitterSettings={emitterSettings}
        accounts={accounts}
        costCenters={costCenters}
        editingInvoice={selectedInvoiceForEdit}
        existingInvoicesCount={invoices.length}
      />

      <InvoiceViewerModal
        isOpen={isInvoiceViewerOpen}
        onClose={() => {
          setIsInvoiceViewerOpen(false);
          setSelectedInvoiceForView(null);
        }}
        invoice={selectedInvoiceForView}
        onMarkAsPaid={handleMarkInvoiceAsPaid}
        onEdit={(inv) => {
          setIsInvoiceViewerOpen(false);
          setSelectedInvoiceForEdit(inv);
          setIsInvoiceModalOpen(true);
        }}
        onDuplicate={handleDuplicateInvoice}
      />
    </div>
  );
}
