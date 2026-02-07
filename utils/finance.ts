import { Installment, AmortizationType, PaymentFrequency } from '../types';

export const calculateAmortizationSchedule = (
  amount: number,
  rate: number, // Monthly rate in %
  term: number,
  frequency: PaymentFrequency,
  type: AmortizationType,
  startDate: string
): { installments: Installment[], totalInterest: number, totalPayable: number } => {
  
  const installments: Installment[] = [];
  let balance = amount;
  let totalInterest = 0;
  
  // Convert monthly rate to period rate
  let periodRate = rate / 100;
  let dateIncrementDays = 30;

  if (frequency === PaymentFrequency.WEEKLY) {
    periodRate = (rate / 100) / 4;
    dateIncrementDays = 7;
  } else if (frequency === PaymentFrequency.BIWEEKLY) {
    periodRate = (rate / 100) / 2;
    dateIncrementDays = 15;
  }

  // Calculate fixed installment for French system
  let fixedPayment = 0;
  if (type === AmortizationType.FRENCH) {
    if (periodRate === 0) {
      fixedPayment = amount / term;
    } else {
      fixedPayment = amount * (periodRate * Math.pow(1 + periodRate, term)) / (Math.pow(1 + periodRate, term) - 1);
    }
  } else {
    // Simple Interest: (Capital / Term) + (Capital * Rate)
    // Note: Simple interest usually implies interest is calculated on the full principal or reducing. 
    // Here implementing "Flat Rate" style common in microfinance: Interest is calculated on initial principal.
    const monthlyInterest = amount * periodRate;
    const monthlyPrincipal = amount / term;
    fixedPayment = monthlyPrincipal + monthlyInterest;
  }

  let currentDate = new Date(startDate);

  for (let i = 1; i <= term; i++) {
    // Increment date
    currentDate.setDate(currentDate.getDate() + dateIncrementDays);
    const dueDate = currentDate.toISOString().split('T')[0];

    let interestPart = 0;
    let capitalPart = 0;

    if (type === AmortizationType.FRENCH) {
      interestPart = balance * periodRate;
      capitalPart = fixedPayment - interestPart;
      balance -= capitalPart;
    } else {
      // Simple (Flat)
      interestPart = amount * periodRate; // Interest on original amount
      capitalPart = amount / term;
      balance -= capitalPart; // Balance effectively reduces by principal
    }

    // Adjust last installment for rounding errors
    if (i === term && type === AmortizationType.FRENCH) {
      const remainingBalance = installments.length > 0 ? installments[installments.length - 1].balanceRemaining : amount;
      // Recalculate roughly for display, but in real app we force balance to 0
       if (balance < 0) balance = 0;
    }
    
    if (balance < 0) balance = 0;

    installments.push({
      number: i,
      dueDate,
      amount: fixedPayment,
      interestPart,
      capitalPart,
      balanceRemaining: balance,
      status: 'PENDING',
      paidAmount: 0
    });

    totalInterest += interestPart;
  }

  return {
    installments,
    totalInterest,
    totalPayable: amount + totalInterest
  };
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
};