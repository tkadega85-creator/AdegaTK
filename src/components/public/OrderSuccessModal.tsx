import React from 'react';
import { Order } from '../../types';
import { useStore } from '../../services/storeContext';
import { CheckCircle2, MessageCircle, ArrowRight, Clock, MapPin, Sparkles } from 'lucide-react';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  const { store, generateWhatsAppLink } = useStore();

  if (!order) return null;

  const waLink = generateWhatsAppLink(order);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-750 rounded-3xl overflow-hidden shadow-2xl p-6 text-center space-y-5">
        {/* Animated Celebration Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="absolute -top-1 -right-1 text-2xl">🎉</span>
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pedido Realizado com Sucesso!</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            Pedido #{order.orderNumber}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Recebemos seu pedido na <strong>{store.name}</strong>!
          </p>
        </div>

        {/* Live Status Tracker Box */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-left space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Tempo estimado de entrega:
            </span>
            <span className="text-amber-400 font-bold">{store.estimatedDeliveryTime}</span>
          </div>

          {/* Simple step tracker */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center gap-2.5 text-xs text-emerald-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span>1. Pedido enviado para a Adega</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700 shrink-0" />
              <span>2. Bebidas separadas e trincando</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700 shrink-0" />
              <span>3. A caminho da sua casa com motoboy</span>
            </div>
          </div>

          {order.deliveryType === 'delivery' && order.address && (
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span className="line-clamp-2">
                {order.address.street}, {order.address.number} - {order.address.neighborhood}
              </span>
            </div>
          )}

          <div className="pt-1 flex justify-between text-xs font-bold text-slate-200">
            <span>Total do pedido:</span>
            <span className="text-amber-400 font-black">
              R$ {order.total.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Abrir Conversa no WhatsApp</span>
          </a>

          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            <span>Voltar ao Cardápio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
