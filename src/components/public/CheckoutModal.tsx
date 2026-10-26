import React, { useState } from 'react';
import { useStore } from '../../services/storeContext';
import { Order } from '../../types';
import {
  X,
  MapPin,
  CreditCard,
  Banknote,
  QrCode,
  Store as StoreIcon,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const {
    store,
    cart,
    cartSubtotal,
    createOrder,
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito'>('pix');
  const [changeFor, setChangeFor] = useState('');
  const [pixCopied, setPixCopied] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const grandTotal = cartSubtotal;

  const handleCopyPix = () => {
    if (!store.payments.pixKey) return;
    navigator.clipboard.writeText(store.payments.pixKey);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2500);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!customerName.trim()) {
      setValidationError('Por favor, informe seu nome completo.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().replace(/\D/g, '').length < 8) {
      setValidationError('Por favor, informe seu número de WhatsApp com DDD.');
      return;
    }

    let parsedChangeFor: number | undefined = undefined;
    if (paymentMethod === 'dinheiro' && changeFor) {
      const num = parseFloat(changeFor.replace(',', '.'));
      if (!isNaN(num) && num > grandTotal) {
        parsedChangeFor = num;
      }
    }

    setIsSubmitting(true);
    try {
      // Create the order in the system (Strictly Retirada no Balcão)
      const newOrder = await createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        paymentMethod,
        changeFor: parsedChangeFor,
        customerNotes: customerNotes.trim(),
      });

      onOrderSuccess(newOrder);
    } catch {
      setValidationError('Ocorreu um erro ao registrar o seu pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-750 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-4 max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
              <StoreIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-white">
                Finalizar Pedido — Retirada no Balcão
              </h2>
              <p className="text-xs text-slate-400">
                Seu pedido será preparado para retirada imediata na loja
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitOrder} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-slate-200 text-xs">
          {validationError && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-300 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Store Location Notice */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
            <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-300 text-xs sm:text-sm">
                Local de Retirada na Adega:
              </h4>
              <p className="text-slate-300 text-xs mt-0.5">
                {store.address ? (
                  <>
                    <strong>{store.name}:</strong> {store.address}{store.neighborhood ? `, ${store.neighborhood}` : ''}
                    {store.city ? ` — ${store.city}` : ''}
                  </>
                ) : (
                  <span>{store.name} — Balcão Principal</span>
                )}
              </p>
              <span className="text-[11px] text-amber-400/90 font-medium mt-1 block">
                ⚡ Bebidas trincando de geladas separadas no balcão assim que você confirmar!
              </span>
            </div>
          </div>

          {/* Customer Identification */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-100 text-xs uppercase tracking-wider flex items-center gap-2">
              <span>Seus Dados para o Pedido</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  WhatsApp com DDD *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: (11) 98765-4321"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Observações do Pedido (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Separar cerveja bem gelada, copos descartáveis..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="font-extrabold text-slate-100 text-xs uppercase tracking-wider">
              Forma de Pagamento
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {store.payments.pix && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'pix'
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/50'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">PIX Direto</span>
                    <QrCode className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-[10px] text-slate-400">Aprovação instantânea</span>
                </button>
              )}

              {store.payments.cash && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('dinheiro')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'dinheiro'
                      ? 'bg-amber-950/40 border-amber-500 text-amber-300 ring-1 ring-amber-500/50'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">Dinheiro</span>
                    <Banknote className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-[10px] text-slate-400">Pague no balcão</span>
                </button>
              )}

              {store.payments.creditCard && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cartao_credito')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'cartao_credito'
                      ? 'bg-sky-950/40 border-sky-500 text-sky-300 ring-1 ring-sky-500/50'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">Cartão de Crédito</span>
                    <CreditCard className="w-4 h-4 text-sky-400" />
                  </div>
                  <span className="text-[10px] text-slate-400">Maquininha no balcão</span>
                </button>
              )}

              {store.payments.debitCard && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cartao_debito')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'cartao_debito'
                      ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">Cartão de Débito</span>
                    <CreditCard className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-[10px] text-slate-400">Maquininha no balcão</span>
                </button>
              )}
            </div>

            {/* Change for cash */}
            {paymentMethod === 'dinheiro' && (
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                <label className="font-semibold text-slate-300 block text-xs">
                  Precisa de troco para quanto? (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 50,00 ou 100,00"
                  value={changeFor}
                  onChange={(e) => setChangeFor(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-750 focus:border-amber-500 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>
            )}

            {/* PIX Key copy */}
            {paymentMethod === 'pix' && store.payments.pixKey && (
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-bold text-emerald-400">Chave PIX da Adega:</span>
                  <span className="text-[11px] text-slate-400">Tipo: {store.payments.pixKeyType.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-750">
                  <span className="font-mono text-xs text-slate-100 truncate pr-2">
                    {store.payments.pixKey}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 rounded-md font-bold text-[11px] transition-all cursor-pointer shrink-0"
                  >
                    {pixCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{pixCopied ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                {store.payments.pixReceiverName && (
                  <p className="text-[10px] text-slate-400">
                    Titular: <strong>{store.payments.pixReceiverName}</strong>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Items Summary in checkout */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-400 font-semibold border-b border-slate-800/80 pb-1.5">
              <span>Resumo do Pedido ({cart.length} itens)</span>
              <span>Retirada no Balcão</span>
            </div>
            <div className="space-y-1">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-xs text-slate-300">
                  <span>
                    <strong>{item.quantity}x</strong> {item.product.name} {item.selectedVariant ? `(${item.selectedVariant.name})` : ''}
                  </span>
                  <span className="font-mono text-slate-200">
                    R$ {(item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-sm font-black text-white">
              <span>Total a Pagar na Retirada:</span>
              <span className="text-amber-400 text-base font-black">
                R$ {grandTotal.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <span>{isSubmitting ? 'Confirmando pedido...' : 'Confirmar Pedido para Retirada'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
