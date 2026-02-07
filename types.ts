export enum LoanStatus {
  PENDING = 'Pendiente',
  ACTIVE = 'Activo',
  COMPLETED = 'Pagado',
  DEFAULTED = 'Mora',
}

export enum PaymentFrequency {
  WEEKLY = 'Semanal',
  BIWEEKLY = 'Quincenal',
  MONTHLY = 'Mensual',
}

export enum AmortizationType {
  FRENCH = 'Francés (Cuota Fija)',
  SIMPLE = 'Interés Simple',
}

export interface Client {
  id: string;
  name: string;
  dni: string;
  phone: string;
  email: string;
  address: string;
  monthlyIncome: number;
  creditScore: number; // 0-100 internal score
  notes?: string;
  avatarUrl?: string;
}

export interface Installment {
  number: number;
  dueDate: string; // ISO date
  amount: number;
  interestPart: number;
  capitalPart: number;
  balanceRemaining: number;
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE';
  paidAmount: number;
  paidDate?: string;
}

export interface Loan {
  id: string;
  clientId: string;
  amount: number;
  interestRate: number; // Monthly percentage
  term: number; // Number of periods
  frequency: PaymentFrequency;
  type: AmortizationType;
  startDate: string;
  status: LoanStatus;
  installments: Installment[];
  totalInterest: number;
  totalPayable: number;
  createdAt: string;
}

export interface AIRiskAnalysis {
  riskLevel: 'Bajo' | 'Medio' | 'Alto';
  score: number;
  reasoning: string;
  recommendation: 'Aprobar' | 'Rechazar' | 'Revisar Manualmente';
}