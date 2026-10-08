import React, { useState } from 'react';
import { useStore } from '../../services/storeContext';
import { ShoppingBag, Phone, Clock, Search, Lock, MapPin } from 'lucide-react';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenAdminLogin: () => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenAdminLogin,
  onSearchChange,
  searchQuery,
}) => {
  const { store, isStoreCurrentlyOpen, storeOpenStatusText, cartTotalCount, cartSubtotal, currentUser } = useStore();
  const [showHoursDropdown, setShowHoursDropdown] = useState(false);

  const cleanPhone = store.whatsappNumber.replace(/\D/g, '');

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      {/* Top micro-bar: Location & Status */}
      <div className="bg-slate-900/80 px-4 py-1.5 text-xs text-slate-400 border-b border-slate-800/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">{store.address}, {store.neighborhood} • {store.city}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Status indicator */}
            <div className="relative">
              <button
                onClick={() => setShowHoursDropdown(!showHoursDropdown)}
                className="flex items-center gap-1.5 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <span className={`w-2 h-2 rounded-full ${isStoreCurrentlyOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span className={isStoreCurrentlyOpen ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                  {isStoreCurrentlyOpen ? 'Aberto Agora' : 'Fechado'}
                </span>
                <Clock className="w-3 h-3 text-slate-500 ml-0.5" />
              </button>

              {/* Hours Dropdown popup */}
              {showHoursDropdown && (
                <div className="absolute right-0 mt-2 w-64 p-3 bg-slate-900 border border-slate-750 rounded-xl shadow-2xl z-50 text-slate-200 text-xs">
                  <div className="font-semibold text-slate-100 mb-2 pb-1 border-b border-slate-800 flex justify-between items-center">
                    <span>Horário de Funcionamento</span>
                    <button onClick={() => setShowHoursDropdown(false)} className="text-slate-400 hover:text-white">✕</button>
                  </div>
                  <div className="space-y-1.5">
                    {store.businessHours.map((h) => (
                      <div key={h.dayOfWeek} className="flex justify-between text-slate-300">
                        <span className="text-slate-400">{h.dayName.split('-')[0]}:</span>
                        <span>{h.isOpen ? `${h.openTime} às ${h.closeTime}` : 'Fechado'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Admin shortcut */}
            <button
              onClick={onOpenAdminLogin}
              className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors font-medium ml-2"
              title={currentUser ? `Logado como ${currentUser.name}` : 'Painel Administrativo'}
            >
              <Lock className="w-3 h-3 text-amber-500/80" />
              <span className="hidden sm:inline">{currentUser ? 'Painel ADM' : 'Admin'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={store.appearance.logoUrl}
              alt={store.name}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-amber-500/30 shadow-md shadow-amber-500/10"
            />
            <span className="absolute -bottom-1 -right-1 text-sm bg-slate-900 rounded-full border border-slate-750 px-0.5">🍾</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl sm:text-2xl tracking-tight text-white flex items-center">
                Adega<span className="text-amber-500">TK</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                Delivery
              </span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-1 hidden sm:block">
              {storeOpenStatusText} • Entrega em ~{store.estimatedDeliveryTime}
            </p>
          </div>
        </div>

        {/* Quick Search on Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="O que você quer beber hoje? (ex: Heineken, Jack...)"
              className="w-full bg-slate-900/90 border border-slate-800 rounded-full pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/40 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* WhatsApp Direct */}
          <a
            href={`https://wa.me/${cleanPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 text-xs sm:text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Falar no WhatsApp"
          >
            <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2.5 px-3 sm:px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-slate-950" />
              {cartTotalCount > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-rose-600 text-white font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-slate-950">
                  {cartTotalCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Carrinho</span>
            {cartSubtotal > 0 && (
              <span className="text-slate-950/80 font-black pl-1 border-l border-slate-950/30">
                R$ {cartSubtotal.toFixed(2).replace('.', ',')}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
