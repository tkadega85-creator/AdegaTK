import React from 'react';
import { Product } from '../../types';
import { Plus, Check, Star, Flame } from 'lucide-react';
import { useStore } from '../../services/storeContext';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { cart, addToCart } = useStore();

  // Check if product is in cart
  const cartItem = cart.find((item) => item.product.id === product.id);
  const isInCart = !!cartItem;

  const hasPromo = product.promoPrice && product.promoPrice < product.price;
  const currentPrice = hasPromo ? product.promoPrice! : product.price;
  const discountPercent = hasPromo
    ? Math.round(((product.price - product.promoPrice!) / product.price) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    // If product has variants, open modal so user can pick
    if (product.variants && product.variants.length > 0) {
      onOpenDetails(product);
    } else {
      addToCart(product, undefined, 1);
    }
  };

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between hover:shadow-xl hover:shadow-black/50 cursor-pointer"
    >
      {/* Top Image area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 filter brightness-95"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {hasPromo && (
            <span className="flex items-center gap-1 bg-rose-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-md">
              <Flame className="w-3 h-3" />
              -{discountPercent}% OFF
            </span>
          )}
          {product.isBestSeller && (
            <span className="flex items-center gap-1 bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded shadow">
              <Star className="w-2.5 h-2.5 fill-slate-950 text-slate-950" />
              MAIS VENDIDO
            </span>
          )}
        </div>

        {/* Volume / Weight badge */}
        {product.volumeOrWeight && (
          <span className="absolute bottom-2 right-2 text-[10px] font-semibold text-slate-300 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded border border-slate-800">
            {product.volumeOrWeight}
          </span>
        )}

        {/* Stock warning */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3 py-1 bg-rose-900/80 text-rose-200 text-xs font-bold rounded-lg border border-rose-700">
              Esgotado no momento
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-bold text-slate-100 text-sm sm:text-base line-clamp-1 group-hover:text-amber-400 transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Variants pill preview if any */}
          {product.variants && product.variants.length > 0 && (
            <div className="mt-2 text-[11px] text-amber-400/90 font-medium flex items-center gap-1">
              <span>Opções:</span>
              <span className="text-slate-400">
                {product.variants.map((v) => v.name).join(' • ')}
              </span>
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {hasPromo && (
              <span className="text-[11px] text-slate-500 line-through">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            )}
            <span className="text-base sm:text-lg font-extrabold text-amber-400 tracking-tight">
              R$ {currentPrice.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={!product.inStock}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !product.inStock
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : isInCart
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600/30'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95'
            }`}
            title="Adicionar ao carrinho"
          >
            {isInCart ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{cartItem?.quantity}x</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
