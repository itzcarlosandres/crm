import React, { useState } from 'react';
import { Loan, Client, Installment, LoanStatus } from '../types';
import { formatCurrency } from '../utils/finance';
import { generateCollectionMessage } from '../services/geminiService';
import { Check, MessageCircle, AlertCircle } from 'lucide-react';

interface PaymentsProps {
  loans: Loan[];
  clients: Client[];
  onRegisterPayment: (loanId: string, installmentNumber: number) => void;
}

export const Payments: React.FC<PaymentsProps> = ({ loans, clients, onRegisterPayment }) => {
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  
  // WhatsApp Message State
  const [waMessage, setWaMessage] = useState<string | null>(null);
  const [loadingWa, setLoadingWa] = useState(false);

  // Flatten next pending installment for all active loans
  const dueInstallments = loans
    .filter(l => l.status === LoanStatus.ACTIVE || l.status === LoanStatus.DEFAULTED)
    .flatMap(loan => {
      const client = clients.find(c => c.id === loan.clientId);
      const nextInstallment = loan.installments.find(i => i.status === 'PENDING' || i.status === 'OVERDUE');
      
      if (!nextInstallment) return [];

      return [{
        loan,
        client,
        installment: nextInstallment
      }];
    })
    .sort((a, b) => new Date(a.installment.dueDate).getTime() - new Date(b.installment.dueDate).getTime());

  const handleGenerateMessage = async (clientName: string, daysOverdue: number, amount: number) => {
    setLoadingWa(true);
    setWaMessage(null);
    const msg = await generateCollectionMessage(clientName, daysOverdue, amount);
    setWaMessage(msg);
    setLoadingWa(false);
  };

  const getDaysOverdue = (dueDate: string) => {
    const diff = new Date().getTime() - new Date(dueDate).getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* List of Dues */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Próximos Vencimientos y Pagos</h2>
        
        {dueInstallments.map(({ loan, client, installment }) => {
            const daysOverdue = getDaysOverdue(installment.dueDate);
            const isOverdue = daysOverdue > 0;

            return (
              <div key={`${loan.id}-${installment.number}`} className={`bg-white p-5 rounded-xl border shadow-sm flex flex-col md:flex-row justify-between items-center transition-all ${selectedLoanId === loan.id ? 'ring-2 ring-brand-500' : 'border-slate-100'}`}>
                <div className="flex items-center gap-4 mb-4 md:mb-0 w-full md:w-auto">
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                     ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                     {new Date(installment.dueDate).getDate()}
                   </div>
                   <div>
                     <h3 className="font-bold text-slate-800">{client?.name}</h3>
                     <p className="text-xs text-slate-500">Préstamo #{loan.id.slice(0,6)} • Cuota {installment.number}/{loan.term}</p>
                     {isOverdue && <span className="text-xs font-semibold text-red-500 flex items-center mt-1"><AlertCircle className="w-3 h-3 mr-1"/> {daysOverdue} días de atraso</span>}
                   </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                   <div className="text-right w-full md:w-auto flex justify-between md:block">
                      <span className="text-sm text-slate-500 md:hidden">Monto:</span>
                      <p className="text-xl font-bold text-slate-800">{formatCurrency(installment.amount)}</p>
                   </div>
                   
                   <div className="flex gap-2 w-full md:w-auto">
                      <button 
                        onClick={() => setSelectedLoanId(selectedLoanId === loan.id ? null : loan.id)}
                        className="flex-1 px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                      >
                         <MessageCircle className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => onRegisterPayment(loan.id, installment.number)}
                        className="flex-1 md:flex-none px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center justify-center font-medium shadow-sm shadow-emerald-200"
                      >
                         <Check className="w-4 h-4 mr-2" />
                         Cobrar
                      </button>
                   </div>
                </div>

                {selectedLoanId === loan.id && (
                  <div className="w-full mt-4 pt-4 border-t border-slate-100 bg-slate-50 -mx-5 px-5 pb-2 rounded-b-xl">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-slate-700 text-sm">Gestión de Cobranza (IA)</h4>
                        <button 
                          onClick={() => handleGenerateMessage(client?.name || '', daysOverdue, installment.amount)}
                          className="text-xs text-brand-600 hover:underline"
                          disabled={loadingWa}
                        >
                          {loadingWa ? 'Generando...' : 'Generar Guión de Cobro'}
                        </button>
                      </div>
                      
                      {waMessage ? (
                         <div className="bg-white p-3 rounded border border-slate-200 text-sm text-slate-600 mb-2">
                            {waMessage}
                            <div className="mt-2 flex justify-end">
                              <a 
                                href={`https://wa.me/${client?.phone?.replace(/\D/g,'')}?text=${encodeURIComponent(waMessage)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                              >
                                Abrir WhatsApp
                              </a>
                            </div>
                         </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Haga clic en generar para obtener una sugerencia de mensaje basada en el nivel de atraso.</p>
                      )}
                  </div>
                )}
              </div>
            );
        })}

        {dueInstallments.length === 0 && (
          <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500">No hay cobros pendientes para hoy.</p>
          </div>
        )}
      </div>

      {/* Mini Stats or Recent Activity */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-lg">
           <h3 className="font-semibold text-lg mb-4">Caja del Día</h3>
           <div className="flex justify-between items-center mb-2">
             <span className="text-slate-300">Total Recaudado</span>
             <span className="font-mono text-xl">$0.00</span>
           </div>
           <div className="flex justify-between items-center">
             <span className="text-slate-300">Operaciones</span>
             <span className="font-mono text-xl">0</span>
           </div>
           <button className="w-full mt-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
              Ver Cierre de Caja
           </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
           <h3 className="font-semibold text-slate-800 mb-4">Top Deudores</h3>
           <ul className="space-y-3">
              {loans.filter(l => l.status === LoanStatus.DEFAULTED).slice(0, 5).map(l => {
                 const client = clients.find(c => c.id === l.clientId);
                 return (
                   <li key={l.id} className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 truncate max-w-[120px]">{client?.name}</span>
                      <span className="text-red-500 font-medium">{formatCurrency(l.amount)}</span>
                   </li>
                 )
              })}
              {loans.filter(l => l.status === LoanStatus.DEFAULTED).length === 0 && (
                <li className="text-sm text-slate-400">Sin deudores en mora. ¡Excelente!</li>
              )}
           </ul>
        </div>
      </div>
    </div>
  );
};