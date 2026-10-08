import React from 'react';
import { useStore } from '../../services/storeContext';
import { Combo, Product } from '../../types';
import { Check, Flame, ShoppingBag, Sparkles } from 'lucide-react';

interface CombosSectionProps {
  onOpenDetails?: (product: Product) => void;
}

export const CombosSection: React.FC<CombosSectionProps> = () => {
  const { combos, addToCart } = useStore();

  const activeCombos = combos.filter((c) => c.isActive);
  if (activeCombos.length === 0) return null;

  const handleAddComboToCart = (combo: Combo) => {
    // Map combo as product to add to cart seamlessly
    const comboAsProduct: Product = {
      id: combo.id,
      storeId: combo.storeId,
      categoryId: 'cat-combos',
      name: combo.name,
      description: combo.description + ' (Itens: ' + combo.includedItems.join(', ') + ')',
      price: combo.originalPrice,
      promoPrice: combo.promoPrice,
      imageUrl: combo.imageUrl,
      inStock: true,
      isActive: true,
      isFeatured: true,
      isBestSeller: true,
      isPromo: true,
      order: 0,
    };
    addToCart(comboAsProduct, undefined, 1);
  };

  return (
    <section className="my-10 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Kits Prontos para a Resenha</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Combos Especiais 🎁
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 sm:mt-0">
          Mais economia e tudo o que você precisa em um único kit
        </p>
      </div>

      {/* Grid of combos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {activeCombos.map((combo) => {
          const discount = Math.round(
            ((combo.originalPrice - combo.promoPrice) / combo.originalPrice) * 100
          );

          return (
            <div
              key={combo.id}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col sm:flex-row group"
            >
              {/* Image side */}
              <div className="relative sm:w-2/5 aspect-[16/10] sm:aspect-auto overflow-hidden bg-slate-950">
                <img
                  src={combo.imageUrl}
                  alt={combo.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-slate-900/80 via-transparent to-transparent" />
                <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded shadow flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  Economize {discount}%
                </span>
              </div>

              {/* Info side */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-amber-400 transition-colors">
                    {combo.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {combo.description}
                  </p>

                  {/* Included items checklist */}
                  <div className="mt-3 space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-xs">
                    <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider block mb-1">
                      O que vem no combo:
                    </span>
                    {combo.includedItems.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 line-through block">
                      R$ {combo.originalPrice.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-xl font-black text-amber-400">
                      R$ {combo.promoPrice.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddComboToCart(combo)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Pedir Combo</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
