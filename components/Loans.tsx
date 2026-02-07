import React, { useState } from 'react';
import { Loan, Client, PaymentFrequency, AmortizationType, LoanStatus, AIRiskAnalysis } from '../types';
import { calculateAmortizationSchedule, formatCurrency } from '../utils/finance';
import { analyzeLoanRisk } from '../services/geminiService';
import { Calculator, CheckCircle, AlertOctagon, BrainCircuit, X } from 'lucide-react';

interface LoansProps {
  loans: Loan[];
  clients: Client[];
  onAddLoan: (loan: Loan) => void;
}

export const Loans: React.FC<LoansProps> = ({ loans, clients, onAddLoan }) => {
  const [view, setView] = useState<'list' | 'create'>('list');
  
  // Create Loan State
  const [selectedClientId, setSelectedClientId] = useState('');
  const [amount, setAmount] = useState(1000);
  const [interestRate, setInterestRate] = useState(5);
  const [term, setTerm] = useState(12);
  const [frequency, setFrequency] = useState<PaymentFrequency>(PaymentFrequency.MONTHLY);
  const [amortizationType, setAmortizationType] = useState<AmortizationType>(AmortizationType.FRENCH);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  
  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIRiskAnalysis | null>(null);

  const handleCreateLoan = () => {
    if (!selectedClientId) return;
    
    const schedule = calculateAmortizationSchedule(amount, interestRate, term, frequency, amortizationType, startDate);
    
    const newLoan: Loan = {
      id: crypto.randomUUID(),
      clientId: selectedClientId,
      amount,
      interestRate,
      term,
      frequency,
      type: amortizationType,
      startDate,
      status: LoanStatus.ACTIVE,
      installments: schedule.installments,
      totalInterest: schedule.totalInterest,
      totalPayable: schedule.totalPayable,
      createdAt: new Date().toISOString()
    };

    onAddLoan(newLoan);
    setView('list');
    setAnalysisResult(null);
  };

  const runAnalysis = async () => {
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeLoanRisk(client, amount, term);
      setAnalysisResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Preview Calculation
  const preview = calculateAmortizationSchedule(amount, interestRate, term, frequency, amortizationType, startDate);

  if (view === 'create') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Nueva Solicitud de Crédito</h2>
          <button onClick={() => setView('list')} className="text-slate-500 hover:text-slate-800">Cancelar</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                value={selectedClientId}
                onChange={(e) => {
                    setSelectedClientId(e.target.value);
                    setAnalysisResult(null);
                }}
              >
                <option value="">Seleccione un cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} - {c.dni}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monto ($)</label>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tasa Interés Mensual (%)</label>
                <input 
                  type="number" 
                  step="0.1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  value={interestRate}
                  onChange={e => setInterestRate(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Plazo (Cuotas)</label>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  value={term}
                  onChange={e => setTerm(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Frecuencia</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  value={frequency}
                  onChange={e => setFrequency(e.target.value as PaymentFrequency)}
                >
                  {Object.values(PaymentFrequency).map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Amortización</label>
              <select 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  value={amortizationType}
                  onChange={e => setAmortizationType(e.target.value as AmortizationType)}
                >
                  {Object.values(AmortizationType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Inicio</label>
               <input 
                  type="date"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
               />
            </div>

            {/* AI Action Button */}
            <div className="pt-2">
              <button 
                type="button"
                disabled={!selectedClientId || isAnalyzing}
                onClick={runAnalysis}
                className="w-full flex items-center justify-center px-4 py-3 bg-purple-100 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <BrainCircuit className="w-5 h-5 mr-2" />
                {isAnalyzing ? 'Analizando con Gemini...' : 'Analizar Riesgo con IA'}
              </button>
            </div>

            {/* AI Result Box */}
            {analysisResult && (
              <div className={`p-4 rounded-lg border ${analysisResult.recommendation === 'Rechazar' ? 'bg-red-50 border-red-200 text-red-800' : analysisResult.recommendation === 'Aprobar' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
                <div className="flex justify-between items-start mb-2">
                   <span className="font-bold text-lg">{analysisResult.recommendation}</span>
                   <span className="text-sm font-medium bg-white bg-opacity-50 px-2 py-1 rounded">Score: {analysisResult.score}/100</span>
                </div>
                <p className="text-sm mb-2">{analysisResult.reasoning}</p>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-75">Nivel de Riesgo: {analysisResult.riskLevel}</p>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-medium text-slate-300 mb-4">Resumen de Cuotas</h3>
              <div className="flex justify-between items-end mb-2">
                <span className="text-slate-400">Cuota Estimada</span>
                <span className="text-3xl font-bold">{formatCurrency(preview.installments[0]?.amount || 0)}</span>
              </div>
              <div className="h-px bg-slate-700 my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Intereses</span>
                  <span className="text-emerald-400">+{formatCurrency(preview.totalInterest)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2">
                  <span className="text-slate-300">Total a Pagar</span>
                  <span>{formatCurrency(preview.totalPayable)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden max-h-96 overflow-y-auto no-scrollbar">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Cuota</th>
                    <th className="px-4 py-3">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {preview.installments.map((inst) => (
                    <tr key={inst.number}>
                      <td className="px-4 py-2 text-slate-600">{inst.number}</td>
                      <td className="px-4 py-2 text-slate-600">{inst.dueDate}</td>
                      <td className="px-4 py-2 font-medium">{formatCurrency(inst.amount)}</td>
                      <td className="px-4 py-2 text-slate-500">{formatCurrency(inst.balanceRemaining)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button 
              onClick={handleCreateLoan}
              disabled={!selectedClientId}
              className="w-full py-4 bg-brand-600 text-white rounded-xl font-semibold shadow-lg shadow-brand-900/20 hover:bg-brand-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar y Crear Préstamo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gestión de Préstamos</h2>
        <button 
          onClick={() => setView('create')}
          className="flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Calculator className="w-5 h-5 mr-2" />
          Nuevo Préstamo
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm font-semibold border-b border-slate-200">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Monto Original</th>
              <th className="px-6 py-4">Saldo Pendiente</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Progreso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loans.map(loan => {
              const client = clients.find(c => c.id === loan.clientId);
              const paidInstallments = loan.installments.filter(i => i.status === 'PAID').length;
              const progress = Math.round((paidInstallments / loan.term) * 100);
              const currentBalance = loan.installments.find(i => i.status !== 'PAID')?.balanceRemaining ?? 0;

              return (
                <tr key={loan.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">
                    {loan.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {client?.name || 'Desconocido'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {formatCurrency(loan.amount)}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">
                    {formatCurrency(currentBalance)}
                  </td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                       ${loan.status === LoanStatus.ACTIVE ? 'bg-blue-100 text-blue-800' : 
                         loan.status === LoanStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                         loan.status === LoanStatus.DEFAULTED ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}
                     `}>
                       {loan.status}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                       <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-brand-500 h-2 rounded-full" style={{width: `${progress}%`}}></div>
                       </div>
                       <span className="text-xs text-slate-500">{progress}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
            {loans.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  No hay préstamos activos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};