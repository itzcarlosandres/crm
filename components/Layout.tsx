import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Banknote, 
  FileText, 
  Settings, 
  Menu, 
  X,
  CreditCard,
  LogOut,
  Bell
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'loans', label: 'Préstamos', icon: Banknote },
    { id: 'payments', label: 'Caja y Pagos', icon: CreditCard },
    { id: 'reports', label: 'Reportes', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-center h-16 bg-slate-950 shadow-md">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
               <Banknote className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">CrediFlow<span className="text-brand-500">Pro</span></span>
          </div>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                ${activeTab === item.id 
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <button className="flex items-center w-full px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
            <Settings className="w-5 h-5 mr-3" />
            Configuración
          </button>
          <button className="flex items-center w-full px-4 py-2 mt-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 lg:px-8">
          <button 
            className="lg:hidden p-2 text-slate-600 rounded-md hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 px-4 lg:px-8 flex items-center">
             <h1 className="text-xl font-semibold text-slate-800 capitalize">
               {navItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
             </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold border border-brand-200">
              AD
            </div>
            <div className="hidden md:block text-sm">
              <p className="font-medium text-slate-700">Admin</p>
              <p className="text-slate-500 text-xs">Gerente General</p>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};