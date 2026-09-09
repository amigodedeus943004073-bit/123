import {
  Account,
  Category,
  CostCenter,
  Transaction,
  AutomationRule,
  Invoice,
  InvoiceEmitter,
} from '../types/finance';

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    name: 'Conta Corrente BAI - Salomão Muanjita',
    type: 'corrente',
    bankName: 'Banco BAI',
    accountNumber: 'AO06 0040 0000 8953 6571 101 24',
    initialBalance: 0.0,
    color: '#2563eb',
    description: 'Para Transferências BAI: 0040 0000 89536571101 24 • Titular: Salomão Muanjita • Multicaixa Express: 943004073',
  },
  {
    id: 'acc-2',
    name: 'Tesouraria & Caixa Físico (Kz)',
    type: 'caixa_fisico',
    bankName: 'Tesouraria SMVM',
    accountNumber: 'Cofre 01 - Sede Cuito (Bié)',
    initialBalance: 0.0,
    color: '#059669',
    description: 'Fundo fixo e entradas em numerário da tesouraria em Kz.',
  },
  {
    id: 'acc-3',
    name: 'Fundo de Reserva & Contingência (Banco BFA)',
    type: 'investimento',
    bankName: 'Banco BFA',
    accountNumber: 'Depósito a Prazo BFA',
    initialBalance: 0.0,
    color: '#7c3aed',
    description: 'Reserva estratégica para emergências e expansão institucional.',
  },
  {
    id: 'acc-4',
    name: 'Conta Convênios & Projetos (Banco BCI)',
    type: 'corrente',
    bankName: 'Banco BCI',
    accountNumber: 'IBAN: AO06 0005 0000 9876 5432 1098 7',
    initialBalance: 0.0,
    color: '#ea580c',
    description: 'Conta vinculada exclusivamente a projectos sociais e parcerias.',
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  // Receitas
  {
    id: 'cat-inc-1',
    name: 'Contribuições & Mantenedores',
    type: 'income',
    color: '#10b981',
    iconName: 'HeartHandshake',
    monthlyBudget: 0,
  },
  {
    id: 'cat-inc-2',
    name: 'Doações & Patrocínios',
    type: 'income',
    color: '#06b6d4',
    iconName: 'Gift',
    monthlyBudget: 0,
  },
  {
    id: 'cat-inc-3',
    name: 'Eventos & Campanhas Comunitárias',
    type: 'income',
    color: '#8b5cf6',
    iconName: 'CalendarCheck',
    monthlyBudget: 0,
  },
  {
    id: 'cat-inc-4',
    name: 'Rendimentos Financeiros / Aplicações',
    type: 'income',
    color: '#6366f1',
    iconName: 'TrendingUp',
    monthlyBudget: 0,
  },
  {
    id: 'cat-inc-5',
    name: 'Serviços & Parcerias Institucionais',
    type: 'income',
    color: '#14b8a6',
    iconName: 'Briefcase',
    monthlyBudget: 0,
  },

  // Despesas
  {
    id: 'cat-exp-1',
    name: 'Folha de Pagamento & Encargos',
    type: 'expense',
    color: '#ef4444',
    iconName: 'Users',
    monthlyBudget: 0,
  },
  {
    id: 'cat-exp-2',
    name: 'Aluguel & Ocupação Predial',
    type: 'expense',
    color: '#f97316',
    iconName: 'Building',
    monthlyBudget: 0,
  },
  {
    id: 'cat-exp-3',
    name: 'Energia, Água & Conectividade',
    type: 'expense',
    color: '#eab308',
    iconName: 'Zap',
    monthlyBudget: 0,
  },
  {
    id: 'cat-exp-4',
    name: 'Projetos Sociais & Assistenciais',
    type: 'expense',
    color: '#ec4899',
    iconName: 'Award',
    monthlyBudget: 0,
  },
  {
    id: 'cat-exp-5',
    name: 'Manutenção, Reformas & Equipamentos',
    type: 'expense',
    color: '#64748b',
    iconName: 'Wrench',
    monthlyBudget: 0,
  },
  {
    id: 'cat-exp-6',
    name: 'Fornecedores & Material de Consumo',
    type: 'expense',
    color: '#f43f5e',
    iconName: 'ShoppingBag',
    monthlyBudget: 0,
  },
  {
    id: 'cat-exp-7',
    name: 'Honorários Contábeis & Assessoria Jurídica',
    type: 'expense',
    color: '#a855f7',
    iconName: 'Scale',
    monthlyBudget: 0,
  },
  {
    id: 'cat-exp-8',
    name: 'TI, Softwares & Comunicação',
    type: 'expense',
    color: '#3b82f6',
    iconName: 'Laptop',
    monthlyBudget: 0,
  },
];

export const INITIAL_COST_CENTERS: CostCenter[] = [
  { id: 'cc-1', code: 'CC-100', name: 'Administração & Diretoria Geral', manager: 'Coordenação Administrativa' },
  { id: 'cc-2', code: 'CC-200', name: 'Ações Sociais & Atendimento', manager: 'Coordenação de Projetos' },
  { id: 'cc-3', code: 'CC-300', name: 'Infraestrutura, Sede & Patrimônio', manager: 'Gestão Predial' },
  { id: 'cc-4', code: 'CC-400', name: 'Eventos, Comunicação & Expansão', manager: 'Equipe de Eventos' },
];

export const INITIAL_AUTOMATIONS: AutomationRule[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_EMITTER_SETTINGS: InvoiceEmitter = {
  name: 'Salomão Muanjita Vinene Moises (SMVM)',
  taxId: '5002504642',
  address: 'Sede - Bairro Fátima',
  city: 'Cuito - Bié',
  postalCode: '',
  country: 'Angola',
  email: 'financeiro@smvm.ao',
  phone: '944449026 / 943004073',
  bankName: 'Banco BAI',
  ibanOrAccount: 'AO06 0040 0000 8953 6571 101 24',
  swiftOrPix: 'Express: 943004073 • Titular: Salomão Muanjita',
  registrationNumber: 'NIF 5002504642',
};

export const INITIAL_INVOICES: Invoice[] = [];
