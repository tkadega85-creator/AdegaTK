import React, { useState } from 'react';
import { useStore } from '../../services/storeContext';
import { CustomerAddress, Order } from '../../types';
import {
  X,
  MapPin,
  CreditCard,
  Banknote,
  QrCode,
  Truck,
  Store as StoreIcon,
  Copy,
  Check,
  Send,
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
    deliveryZones,
    createOrder,
    generateWhatsAppLink,
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'retirada'>('delivery');

  // Address
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState(
    deliveryZones.length > 0 ? deliveryZones[0].id : ''
  );
  const [customNeighborhood, setCustomNeighborhood] = useState('');
  const [reference, setReference] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito'>('pix');
  const [changeFor, setChangeFor] = useState('');
  const [pixCopied, setPixCopied] = useState(false);
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  // Calculate delivery fee
  const activeZone = deliveryZones.find((z) => z.id === selectedNeighborhoodId);
  const rawDeliveryFee = activeZone ? activeZone.fee : store.defaultDeliveryFee;
  const isFreeDelivery = cartSubtotal >= store.freeDeliveryOver;
  const deliveryFee = deliveryType === 'delivery' ? (isFreeDelivery ? 0 : rawDeliveryFee) : 0;
  const grandTotal = cartSubtotal + deliveryFee;

  const currentNeighborhoodName = activeZone
    ? activeZone.neighborhood
    : customNeighborhood || store.neighborhood;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(store.payments.pixKey);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2500);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!customerName.trim()) {
      setValidationError('Por favor, informe seu nome completo.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      setValidationError('Por favor, informe seu número de WhatsApp com DDD.');
      return;
    }

    let addressObj: CustomerAddress | undefined = undefined;

    if (deliveryType === 'delivery') {
      if (!street.trim() || !number.trim()) {
        setValidationError('Por favor, preencha a Rua e o Número para a entrega.');
        return;
      }
      addressObj = {
        street: street.trim(),
        number: number.trim(),
        complement: complement.trim(),
        neighborhood: currentNeighborhoodName,
        reference: reference.trim(),
        city: store.city,
      };
    }

    let parsedChangeFor: number | undefined = undefined;
    if (paymentMethod === 'dinheiro' && changeFor) {
      const num = parseFloat(changeFor.replace(',', '.'));
      if (!isNaN(num) && num > grandTotal) {
        parsedChangeFor = num;
      }
    }

    // Create the order in the system
    const newOrder = createOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryType,
      address: addressObj,
      paymentMethod,
      changeFor: parsedChangeFor,
      customerNotes: customerNotes.trim(),
      deliveryFee,
    });

    // Generate link & trigger WhatsApp in new window/tab
    const waUrl = generateWhatsAppLink(newOrder);
    window.open(waUrl, '_blank');

    // Notify success
    onOrderSuccess(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-750 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-4 max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-white">
                Finalizar Pedido
              </h2>
              <p className="text-xs text-slate-400">
                Preencha os dados para receber seu pedido geladíssimo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmitOrder} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-slate-200">
          {validationError && (
            <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* 1. Identification */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>1. Seus Dados de Contato</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Seu Nome *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João Silva"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">WhatsApp com DDD *</label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: (11) 99876-5432"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Type */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              2. Forma de Recebimento
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('delivery')}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  deliveryType === 'delivery'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Truck className="w-5 h-5 text-amber-400" />
                <span className="text-xs sm:text-sm">Receber por Delivery</span>
                <span className="text-[10px] text-slate-400">
                  {isFreeDelivery ? 'Frete Grátis' : `~${store.estimatedDeliveryTime}`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('retirada')}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  deliveryType === 'retirada'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <StoreIcon className="w-5 h-5 text-amber-400" />
                <span className="text-xs sm:text-sm">Retirar no Balcão</span>
                <span className="text-[10px] text-slate-400">Sem taxa de entrega</span>
              </button>
            </div>
          </div>

          {/* 3. Address fields if delivery */}
          {deliveryType === 'delivery' && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>3. Endereço de Entrega</span>
              </h3>

              {/* Neighborhood select */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Selecione sua Região / Bairro:
                </label>
                <select
                  value={selectedNeighborhoodId}
                  onChange={(e) => setSelectedNeighborhoodId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none"
                >
                  {deliveryZones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.neighborhood} — Taxa: R$ {zone.fee.toFixed(2).replace('.', ',')} ({zone.estimatedTime})
                    </option>
                  ))}
                  <option value="other">Outro Bairro (Digitar manualmente)</option>
                </select>
              </div>

              {selectedNeighborhoodId === 'other' && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nome do seu Bairro</label>
                  <input
                    type="text"
                    required
                    placeholder="Digite o nome do seu bairro"
                    value={customNeighborhood}
                    onChange={(e) => setCustomNeighborhood(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">Rua / Avenida *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Rua das Flores"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Número *</label>
                  <input
                    type="text"
                    required
                    placeholder="120"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Complemento</label>
                  <input
                    type="text"
                    placeholder="Apto 42, Bloco C"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Ponto de Referência</label>
                  <input
                    type="text"
                    placeholder="Ao lado do posto"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. Payment method */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              4. Forma de Pagamento
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {store.payments.pix && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'pix'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs">PIX</span>
                </button>
              )}

              {store.payments.cash && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('dinheiro')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'dinheiro'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-amber-400" />
                  <span className="text-xs">Dinheiro</span>
                </button>
              )}

              {store.payments.creditCard && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cartao_credito')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'cartao_credito'
                      ? 'bg-sky-500/10 border-sky-500 text-sky-300 font-bold'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-sky-400" />
                  <span className="text-xs">Crédito</span>
                </button>
              )}

              {store.payments.debitCard && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cartao_debito')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'cartao_debito'
                      ? 'bg-sky-500/10 border-sky-500 text-sky-300 font-bold'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-sky-400" />
                  <span className="text-xs">Débito</span>
                </button>
              )}
            </div>

            {/* PIX Details */}
            {paymentMethod === 'pix' && (
              <div className="p-3.5 bg-emerald-950/20 border border-emerald-800/60 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300">Chave PIX da Adega:</span>
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="flex items-center gap-1 text-[11px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-2 py-1 rounded-lg border border-emerald-500/30 transition-colors"
                  >
                    {pixCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{pixCopied ? 'Chave Copiada!' : 'Copiar Chave'}</span>
                  </button>
                </div>
                <div className="font-mono bg-slate-950/80 px-3 py-2 rounded-xl text-emerald-400 select-all border border-slate-800 text-center">
                  {store.payments.pixKey}
                </div>
                <p className="text-[11px] text-slate-400">
                  Beneficiário: <strong className="text-slate-200">{store.payments.pixReceiverName}</strong>. Envie o comprovante no WhatsApp após o pedido.
                </p>
              </div>
            )}

            {/* Cash Troco input */}
            {paymentMethod === 'dinheiro' && (
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1 text-xs">
                <label className="text-slate-300 font-semibold block">
                  Precisa de troco para quanto? (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 50,00 ou 100,00 (deixe em branco se não precisar)"
                  value={changeFor}
                  onChange={(e) => setChangeFor(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>
            )}

            {(paymentMethod === 'cartao_credito' || paymentMethod === 'cartao_debito') && (
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-sky-400 shrink-0" />
                <span>O motoboy levará a maquininha de cartão até o seu endereço.</span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1 pt-2 border-t border-slate-800">
            <label className="text-xs text-slate-400 block">
              Observações gerais do pedido:
            </label>
            <input
              type="text"
              placeholder="Ex: Tocar interfone, cervejas bem geladas..."
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Order Totals Summary */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal ({cart.length} itens):</span>
              <span className="text-slate-200">R$ {cartSubtotal.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Taxa de Entrega:</span>
              <span className="text-slate-200">
                {deliveryType === 'retirada' ? (
                  'Grátis (Retirada)'
                ) : isFreeDelivery ? (
                  <span className="text-emerald-400 font-bold">GRÁTIS</span>
                ) : (
                  `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`
                )}
              </span>
            </div>
            <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
              <span>TOTAL A PAGAR:</span>
              <span className="text-amber-400 text-lg">
                R$ {grandTotal.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2.5 py-4 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Send className="w-5 h-5 text-slate-950" />
              <span>Enviar Pedido pelo WhatsApp</span>
            </button>
            <p className="text-[11px] text-center text-slate-500 mt-2">
              Seu pedido será registrado no sistema e enviado diretamente ao WhatsApp da {store.name}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
