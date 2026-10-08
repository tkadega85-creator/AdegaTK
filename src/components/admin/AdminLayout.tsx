import React, { useState } from 'react';
import { useStore } from '../../services/storeContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Flame,
  Gift,
  Star,
  Truck,
  CreditCard,
  Clock,
  Store,
  Palette,
  Users,
  LogOut,
  Bell,
  ExternalLink,
  Menu,
  X,
  RotateCcw
} from 'lucide-react';
import { DashboardView } from './DashboardView';
import { ProductsManager } from './ProductsManager';
import { CategoriesManager } from './CategoriesManager';
import { OrdersManager } from './OrdersManager';
import { CombosManager } from './CombosManager';
import { DeliveryManager } from './DeliveryManager';
import { PaymentManager } from './PaymentManager';
import { HoursManager } from './HoursManager';
import { StoreInfoManager } from './StoreInfoManager';
import { AppearanceManager } from './AppearanceManager';
import { UsersManager } from './UsersManager';

interface AdminLayoutProps {
  onBackToStore: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToStore }) => {
  const {
    currentUser,
    logout,
    store,
    pendingOrdersCount,
    resetToDefaults,
  } = useStore();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'categories', label: 'Categorias', icon: Layers },
    { id: 'combos', label: 'Combos & Kits', icon: Gift },
    { id: 'delivery', label: 'Delivery & Taxas', icon: Truck },
    { id: 'payments', label: 'Formas de Pagamento', icon: CreditCard },
    { id: 'hours', label: 'Horários da Loja', icon: Clock },
    { id: 'store_info', label: 'Dados da Loja', icon: Store },
    { id: 'appearance', label: 'Aparência & Tema', icon: Palette },
    { id: 'users', label: 'Usuários & Permissões', icon: Users },
  ];

  const handleLogout = () => {
    logout();
    onBackToStore();
  };

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigateTab={(tab) => setActiveTab(tab)} />;
      case 'products':
        return <ProductsManager />;
      case 'categories':
        return <CategoriesManager />;
      case 'orders':
        return <OrdersManager />;
      case 'combos':
        return <CombosManager />;
      case 'delivery':
        return <DeliveryManager />;
      case 'payments':
        return <PaymentManager />;
      case 'hours':
        return <HoursManager />;
      case 'store_info':
        return <StoreInfoManager />;
      case 'appearance':
        return <AppearanceManager />;
      case 'users':
        return <UsersManager />;
      default:
        return <DashboardView onNavigateTab={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-black text-lg text-white">
            Painel <span className="text-amber-500">AdegaTK</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {pendingOrdersCount > 0 && (
            <button
              onClick={() => { setActiveTab('orders'); setMobileMenuOpen(false); }}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-lg text-xs font-bold"
            >
              <Bell className="w-3.5 h-3.5 animate-bounce" />
              <span>{pendingOrdersCount}</span>
            </button>
          )}
          <button
            onClick={onBackToStore}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-amber-400"
            title="Ir para o Cardápio"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-30 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo / Brand */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={store.appearance.logoUrl}
                alt="Logo"
                className="w-10 h-10 rounded-xl object-cover border border-amber-500/30"
              />
              <div>
                <div className="font-black text-base text-white tracking-tight">
                  {store.name}
                </div>
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  Painel de Gestão
                </div>
              </div>
            </div>
          </div>

          {/* User badge */}
          {currentUser && (
            <div className="px-5 py-3 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between text-xs">
              <div className="truncate">
                <span className="font-bold text-slate-200 block truncate">{currentUser.name}</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  {currentUser.role}
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/15'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-slate-950 text-white' : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Action Items */}
        <div className="p-3 border-t border-slate-800 space-y-1.5 bg-slate-950/60 text-xs">
          {/* Quick link to client shop */}
          <button
            onClick={onBackToStore}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-amber-500" />
            <span className="font-semibold">Ver Cardápio Público</span>
          </button>

          {/* Reset Demo Data button */}
          <button
            onClick={() => {
              if (confirm('Restaurar dados de demonstração originais da AdegaTK?')) {
                resetToDefaults();
              }
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Restaura produtos, fotos e pedidos iniciais caso queira resetar"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restaurar Demo</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-colors cursor-pointer font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {/* Top Header desktop */}
        <div className="hidden md:flex items-center justify-between pb-6 mb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Ambiente Seguro: <strong className="text-white">Loja Ativa ({store.slug})</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
              Online
            </span>
          </div>

          <div className="flex items-center gap-3">
            {pendingOrdersCount > 0 && (
              <button
                onClick={() => setActiveTab('orders')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-bold hover:bg-amber-500/25 transition-colors cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 animate-bounce" />
                <span>{pendingOrdersCount} novo(s) pedido(s) pendente(s)</span>
              </button>
            )}

            <button
              onClick={onBackToStore}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-750 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
              <span>Cardápio do Cliente</span>
            </button>
          </div>
        </div>

        {/* Dynamic Section rendering */}
        {renderActiveContent()}
      </main>
    </div>
  );
};
