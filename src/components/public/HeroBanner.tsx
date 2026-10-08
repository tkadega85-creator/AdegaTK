import React from 'react';
import { useStore } from '../../services/storeContext';
import { Search, Zap, Snowflake, ShieldCheck, Flame, ArrowDown } from 'lucide-react';

interface HeroBannerProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onScrollToMenu: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  onSearchChange,
  onScrollToMenu,
}) => {
  const { store } = useStore();

  return (
    <div className="relative overflow-hidden bg-slate-950 border-b border-slate-800/60">
      {/* Background with dark overlay & subtle atmospheric glow */}
      <div className="absolute inset-0 z-0">
        <img
          src={store.appearance.bannerUrl}
          alt={store.name}
          className="w-full h-full object-cover object-center opacity-30 filter brightness-75 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/60" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-8 pb-10 sm:pt-12 sm:pb-14 flex flex-col items-center text-center">
        {/* Brand pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-4 backdrop-blur-sm">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Distribuidora Oficial & Delivery 24h</span>
        </div>

        {/* Title & Slogan */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight max-w-3xl leading-[1.1]">
          {store.name}
        </h1>
        <p className="mt-3 text-lg sm:text-2xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
          {store.slogan}
        </p>
        <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl">
          {store.description}
        </p>

        {/* Feature Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-medium text-slate-300">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Entrega ~{store.estimatedDeliveryTime}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
            <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cervejas trincando</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>PIX ou Cartão na porta</span>
          </div>
        </div>

        {/* Search Bar - Responsive Focus */}
        <div className="mt-7 w-full max-w-xl">
          <div className="relative flex items-center bg-slate-900/95 border-2 border-slate-750 hover:border-amber-500/60 focus-within:border-amber-500 rounded-2xl shadow-xl shadow-black/40 transition-all p-1.5">
            <div className="pl-3 pr-2 text-amber-500">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="🔎 O que você está procurando? (cerveja, whisky, gin...)"
              className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-sm sm:text-base py-2.5 px-1 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="px-3 py-1 text-xs text-slate-400 hover:text-white"
              >
                Limpar
              </button>
            )}
            <button
              onClick={onScrollToMenu}
              className="shrink-0 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Quick Action CTA Buttons */}
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={onScrollToMenu}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Ver Cardápio</span>
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            onClick={onScrollToMenu}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-200 font-bold text-sm rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Fazer Pedido</span>
          </button>
        </div>
      </div>
    </div>
  );
};
