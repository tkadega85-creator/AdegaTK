import React from 'react';
import { useStore } from '../../services/storeContext';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { Flame } from 'lucide-react';

interface PromoSectionProps {
  onOpenDetails: (product: Product) => void;
}

export const PromoSection: React.FC<PromoSectionProps> = ({ onOpenDetails }) => {
  const { products } = useStore();

  const promoProducts = products.filter(
    (p) => p.isActive && p.isPromo && p.promoPrice && p.promoPrice < p.price
  );

  if (promoProducts.length === 0) return null;

  return (
    <section className="my-8 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-500 border border-rose-500/30">
            <Flame className="w-5 h-5 fill-rose-500" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Ofertas Especiais 🔥
            </h2>
            <p className="text-xs text-slate-400">
              Preços promocionais por tempo limitado. Aproveite!
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {promoProducts.slice(0, 4).map((prod) => (
          <ProductCard key={prod.id} product={prod} onOpenDetails={onOpenDetails} />
        ))}
      </div>
    </section>
  );
};
