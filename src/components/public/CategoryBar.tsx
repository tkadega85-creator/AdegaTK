import React, { useRef } from 'react';
import { useStore } from '../../services/storeContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryBarProps {
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategoryId,
  onSelectCategory,
}) => {
  const { categories } = useStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Active categories only, sorted by order
  const activeCategories = categories
    .filter((c) => c.isActive)
    .sort((a, b) => a.order - b.order);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-[105px] sm:top-[112px] z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto px-4 relative flex items-center">
        {/* Left scroll chevron desktop */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute -left-1 z-10 w-7 h-7 rounded-full bg-slate-900 border border-slate-750 items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 shadow-md transition-colors"
          aria-label="Rolar para esquerda"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable track */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full px-1 py-1"
        >
          {/* "Todos" button */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedCategoryId === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
                : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span>✨</span>
            <span>Todos</span>
          </button>

          {/* Quick Filter: Promoções */}
          <button
            onClick={() => onSelectCategory('promo')}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedCategoryId === 'promo'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 scale-[1.02]'
                : 'bg-rose-950/30 text-rose-300 hover:bg-rose-900/40 border border-rose-800/50'
            }`}
          >
            <span>🔥</span>
            <span>Promoções</span>
          </button>

          {/* Quick Filter: Mais Vendidos */}
          <button
            onClick={() => onSelectCategory('bestsellers')}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedCategoryId === 'bestsellers'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
                : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span>⭐</span>
            <span>Mais Vendidos</span>
          </button>

          {/* Dynamic Categories from Admin */}
          {activeCategories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{cat.icon || '📦'}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right scroll chevron desktop */}
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute -right-1 z-10 w-7 h-7 rounded-full bg-slate-900 border border-slate-750 items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 shadow-md transition-colors"
          aria-label="Rolar para direita"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
