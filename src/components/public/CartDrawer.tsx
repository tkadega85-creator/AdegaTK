import React from 'react';
import { useStore } from '../../services/storeContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Store as StoreIcon } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const {
    cart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartTotalCount,
    store,
  } = useStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-lg text-white">Seu Carrinho</h2>
                <p className="text-xs text-slate-400">
                  {cartTotalCount} {cartTotalCount === 1 ? 'item adicionado' : 'itens adicionados'} • Retirada no Balcão
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-slate-400 hover:text-rose-400 transition-colors px-2 py-1 cursor-pointer"
                  title="Esvaziar carrinho"
                >
                  Limpar
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Store Pickup Notice */}
          {cart.length > 0 && (
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 text-xs flex items-center gap-2 text-slate-300">
              <StoreIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                Modalidade: <strong>Retirada Imediata no Balcão</strong> da Adega
              </span>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center text-3xl">
                  🛒
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Seu carrinho está vazio</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Adicione cervejas geladas, destilados ou combos para retirar na adega!
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Explorar Bebidas
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex gap-3 items-center justify-between"
                >
                  {/* Thumbnail */}
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-900 shrink-0 border border-slate-800"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-750 flex items-center justify-center text-lg shrink-0">
                      🍾
                    </div>
                  )}

                  {/* Name and variation */}
                  <div className="flex-1 min-w-0 pr-1">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-100 truncate">
                      {item.product.name}
                    </h4>
                    {item.selectedVariant && (
                      <p className="text-[11px] text-amber-400 font-medium">
                        {item.selectedVariant.name}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-[10px] text-slate-400 italic truncate mt-0.5">
                        Obs: {item.notes}
                      </p>
                    )}
                    <div className="text-xs font-extrabold text-slate-300 mt-1">
                      R$ {item.unitPrice.toFixed(2).replace('.', ',')}
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                      <button
                        onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-bold text-xs text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remover</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 space-y-3">
              {/* Calculations */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal dos itens</span>
                  <span className="font-semibold text-slate-200">
                    R$ {cartSubtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Retirada no Balcão</span>
                  <span className="font-semibold text-emerald-400">
                    Sem custo de frete
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-800/80 font-bold text-white">
                  <span>Total do Pedido</span>
                  <span className="text-amber-400 text-base font-black">
                    R$ {cartSubtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Order Minimum validation */}
              {cartSubtotal < store.minOrderValue && store.minOrderValue > 0 && (
                <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center text-xs text-amber-300 font-medium">
                  Pedido mínimo na adega: R$ {store.minOrderValue.toFixed(2).replace('.', ',')}
                </div>
              )}

              {/* Proceed Button */}
              <button
                onClick={onProceedToCheckout}
                disabled={cartSubtotal < store.minOrderValue}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>Continuar para Retirada no Balcão</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
