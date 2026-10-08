import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '../../types';
import { useStore } from '../../services/storeContext';
import { X, Plus, Minus, ShoppingBag, Flame, Star, Check } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart, categories } = useStore();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [addedAnimation, setAddedAnimation] = useState(false);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setNotes('');
      setAddedAnimation(false);
      // Auto select first variant if available
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
      } else {
        setSelectedVariant(undefined);
      }
    }
  }, [product]);

  if (!product) return null;

  const category = categories.find((c) => c.id === product.categoryId);

  const activePrice = selectedVariant
    ? selectedVariant.promoPrice ?? selectedVariant.price
    : product.promoPrice ?? product.price;

  const originalPrice = selectedVariant ? selectedVariant.price : product.price;
  const hasPromo = activePrice < originalPrice;
  const totalPrice = activePrice * quantity;

  const handleAdd = () => {
    addToCart(product, selectedVariant, quantity, notes.trim());
    setAddedAnimation(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-750 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          {/* Top Big Image */}
          <div className="relative aspect-[16/10] w-full bg-slate-950">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30" />

            {/* Badges on top of image */}
            <div className="absolute bottom-3 left-4 flex gap-2">
              {hasPromo && (
                <span className="flex items-center gap-1 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                  <Flame className="w-3.5 h-3.5" />
                  PROMOÇÃO
                </span>
              )}
              {product.isBestSeller && (
                <span className="flex items-center gap-1 bg-amber-500 text-slate-950 text-xs font-bold px-2 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 fill-slate-950" />
                  MAIS VENDIDO
                </span>
              )}
            </div>
          </div>

          {/* Details Content */}
          <div className="p-5 sm:p-6 space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                {category?.name || 'Adega'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {product.name}
              </h2>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Pricing Details */}
            <div className="flex items-baseline gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-2xl font-black text-amber-400">
                R$ {activePrice.toFixed(2).replace('.', ',')}
              </span>
              {hasPromo && (
                <span className="text-sm text-slate-500 line-through">
                  R$ {originalPrice.toFixed(2).replace('.', ',')}
                </span>
              )}
              {product.volumeOrWeight && (
                <span className="text-xs text-slate-400 ml-auto font-medium">
                  {product.volumeOrWeight}
                </span>
              )}
            </div>

            {/* Product Variants (if configured) */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Escolha o tamanho / opção:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const variantPrice = v.promoPrice ?? v.price;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold'
                            : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                        }`}
                      >
                        <span className="text-xs sm:text-sm">{v.name}</span>
                        <span className="text-xs font-bold text-amber-400">
                          R$ {variantPrice.toFixed(2).replace('.', ',')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Customer Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Alguma observação para este item?
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Ex: Mandar bem trincando, copos descartáveis, etc."
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions (Sticky bottom) */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          {/* Quantity Controls */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-sm text-white">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Submit button */}
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm sm:text-base shadow-lg transition-all cursor-pointer ${
              addedAnimation
                ? 'bg-emerald-500 text-slate-950 scale-95'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-5 h-5 text-slate-950" />
                <span>Adicionado!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" />
                <span>Adicionar • R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
