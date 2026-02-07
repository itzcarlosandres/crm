import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Clients } from './components/Clients';
import { Loans } from './components/Loans';
import { Payments } from './components/Payments';
import { Client, Loan, LoanStatus } from './types';

// Mock Initial Data
const INITIAL_CLIENTS: Client[] = [
  { id: '1', name: 'Roberto Gómez', dni: '8401923', phone: '+52 55 1234 5678', email: 'roberto@email.com', address: 'Av. Reforma 222', monthlyIncome: 12000, creditScore: 85, avatarUrl: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'María Sanchez', dni: '9182736', phone: '+52 55 8765 4321', email: 'maria@email.com', address: 'Calle 5 de Mayo, Centro', monthlyIncome: 8500, creditScore: 60, avatarUrl: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Carlos Ruiz', dni: '1122334', phone: '+52 55 9988 7766', email: 'carlos@email.com', address: 'Colonia Roma Norte', monthlyIncome: 18000, creditScore: 92, avatarUrl: 'https://i.pravatar.cc/150?u=3' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // App State (Simulating Database)
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [loans, setLoans] = useState<Loan[]>([]);

  const handleAddClient = (newClient: Client) => {
    setClients(prev => [...prev, newClient]);
  };

  const handleAddLoan = (newLoan: Loan) => {
    setLoans(prev => [...prev, newLoan]);
  };

  const handleRegisterPayment = (loanId: string, installmentNumber: number) => {
    setLoans(prevLoans => prevLoans.map(loan => {
      if (loan.id !== loanId) return loan;

      const updatedInstallments = loan.installments.map(inst => {
        if (inst.number === installmentNumber) {
          return { ...inst, status: 'PAID', paidAmount: inst.amount, paidDate: new Date().toISOString() };
        }
        return inst;
      });

      // Check if all installments are paid
      const allPaid = updatedInstallments.every(i => i.status === 'PAID' as any); // Type assertion for string strictness
      
      return {
        ...loan,
        status: allPaid ? LoanStatus.COMPLETED : loan.status,
        installments: updatedInstallments
      };
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard loans={loans} clients={clients} />;
      case 'clients':
        return <Clients clients={clients} onAddClient={handleAddClient} />;
      case 'loans':
        return <Loans loans={loans} clients={clients} onAddLoan={handleAddLoan} />;
      case 'payments':
        return <Payments loans={loans} clients={clients} onRegisterPayment={handleRegisterPayment} />;
      case 'reports':
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <div className="text-6xl mb-4">📊</div>
             <h2 className="text-xl font-semibold">Módulo de Reportes</h2>
             <p>Disponible en la versión Enterprise (Exportación Excel/PDF)</p>
          </div>
        );
      default:
        return <Dashboard loans={loans} clients={clients} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onNavigate={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;