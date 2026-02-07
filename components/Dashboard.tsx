import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { TrendingUp, Users, AlertTriangle, Wallet } from 'lucide-react';
import { Loan, Client, LoanStatus } from '../types';
import { formatCurrency } from '../utils/finance';

interface DashboardProps {
  loans: Loan[];
  clients: Client[];
}

export const Dashboard: React.FC<DashboardProps> = ({ loans, clients }) => {
  // Calculated Metrics
  const activeLoans = loans.filter(l => l.status === LoanStatus.ACTIVE);
  const totalInvested = activeLoans.reduce((acc, curr) => acc + curr.amount, 0);
  
  const expectedCollection = activeLoans.reduce((acc, loan) => {
    // Simple mock logic for expected monthly collection
    const monthlyPart = loan.installments[0]?.amount || 0;
    return acc + monthlyPart;
  }, 0);

  const defaultedLoans = loans.filter(l => l.status === LoanStatus.DEFAULTED).length;

  const data = [
    { name: 'Ene', cobrado: 4000, esperado: 4200 },
    { name: 'Feb', cobrado: 3000, esperado: 4500 },
    { name: 'Mar', cobrado: 2000, esperado: 5000 }, // Mock current month
    { name: 'Abr', cobrado: 0, esperado: 5200 },
    { name: 'May', cobrado: 0, esperado: 5300 },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Wallet className="w-8 h-8" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-slate-500">Cartera Activa</p>
            <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(totalInvested)}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-slate-500">Recaudo Mensual (Est)</p>
            <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(expectedCollection)}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <Users className="w-8 h-8" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-slate-500">Clientes Totales</p>
            <h3 className="text-2xl font-bold text-slate-800">{clients.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-slate-500">Créditos en Mora</p>
            <h3 className="text-2xl font-bold text-slate-800">{defaultedLoans}</h3>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Proyección de Recaudo vs Real</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  cursor={{fill: '#f1f5f9'}}
                />
                <Bar dataKey="cobrado" name="Cobrado Real" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="esperado" name="Esperado" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Tendencia de Nuevos Clientes</h3>
          <div className="h-72 w-full">
             <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { month: 'E', val: 10 },
                { month: 'F', val: 15 },
                { month: 'M', val: 12 },
                { month: 'A', val: 20 },
                { month: 'M', val: 28 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="val" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, fill: '#8b5cf6'}} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <span className="text-green-500 font-bold text-sm">+12%</span>
              <span className="text-slate-500 text-sm ml-1">vs mes anterior</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};