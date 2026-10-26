import React, { useState } from 'react';
import { useStore } from '../../services/storeContext';
import { Order, OrderStatus } from '../../types';
import {
  ShoppingBag,
  MessageCircle,
  Store as StoreIcon,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ExternalLink,
  QrCode,
  Banknote,
  CreditCard
} from 'lucide-react';

export const OrdersManager: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    deleteOrder,
    generateWhatsAppLink,
    store,
  } = useStore();

  const [activeTab, setActiveTab] = useState<string>('todos');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const statusList: { key: string; label: string; count: number }[] = [
    { key: 'todos', label: 'Todos', count: orders.length },
    { key: 'novo', label: 'Novos', count: orders.filter((o) => o.status === 'novo').length },
    { key: 'confirmado', label: 'Confirmados', count: orders.filter((o) => o.status === 'confirmado').length },
    { key: 'preparando', label: 'Em Preparo', count: orders.filter((o) => o.status === 'preparando').length },
    { key: 'pronto_retirada', label: 'Prontos para Retirada', count: orders.filter((o) => o.status === 'pronto_retirada').length },
    { key: 'finalizado', label: 'Finalizados no Balcão', count: orders.filter((o) => o.status === 'finalizado').length },
    { key: 'cancelado', label: 'Cancelados / Estornados', count: orders.filter((o) => o.status === 'cancelado').length },
  ];

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'todos') return true;
    return o.status === activeTab;
  });

  const statusConfig: Record<OrderStatus, { label: string; badge: string; next?: OrderStatus; nextLabel?: string }> = {
    novo: {
      label: 'Novo Pedido',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      next: 'confirmado',
      nextLabel: 'Confirmar Pedido',
    },
    confirmado: {
      label: 'Confirmado',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      next: 'preparando',
      nextLabel: 'Iniciar Preparação',
    },
    preparando: {
      label: 'Em Preparação',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      next: 'pronto_retirada',
      nextLabel: 'Avisar: Pronto para Retirada',
    },
    pronto_retirada: {
      label: 'Pronto para Retirada',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      next: 'finalizado',
      nextLabel: 'Marcar como Entregue no Balcão',
    },
    finalizado: {
      label: 'Finalizado no Balcão',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    cancelado: {
      label: 'Cancelado / Estornado',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
  };

  const generateStatusMessageWhatsApp = (order: Order, status: OrderStatus): string => {
    const cleanPhone = order.customerPhone.replace(/\D/g, '');
    let msg = `Olá, *${order.customerName}*! Aqui é da *${store.name}*.\n\n`;

    if (status === 'confirmado') {
      msg += `✅ Seu pedido *#${order.orderNumber}* foi *CONFIRMADO* e já está entrando em separação!\n\nTe avisaremos assim que estiver geladíssimo pronto para retirada no balcão!`;
    } else if (status === 'pronto_retirada') {
      msg += `🍺 *SEU PEDIDO ESTÁ PRONTO PARA RETIRADA!*\n\nPedido: *#${order.orderNumber}*\nTotal: *R$ ${order.total.toFixed(2).replace('.', ',')}*\n`;
      if (store.address) {
        msg += `📍 Local de Retirada: ${store.address}${store.neighborhood ? `, ${store.neighborhood}` : ''}\n`;
      }
      msg += `Pode vir retirar no balcão da adega! Aguardamos você.`;
    } else if (status === 'finalizado') {
      msg += `🎉 Seu pedido *#${order.orderNumber}* foi finalizado e retirado no balcão!\n\nEsperamos que curta bastante! Qualquer coisa estamos à disposição. Saúde! 🍻`;
    } else {
      msg += `Atualização sobre o seu pedido *#${order.orderNumber}*: status alterado para *${statusConfig[status]?.label || status}*.`;
    }

    return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Gerenciamento de Pedidos (Balcão)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Controle os pedidos em tempo real desde a chegada até a retirada no balcão da adega
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {orders.length} pedido(s) registrado(s)
          </span>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {statusList.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-slate-950 text-white' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List / Cards */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 space-y-2">
            <ShoppingBag className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm font-semibold">Nenhum pedido encontrado nesta aba.</p>
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const cfg = statusConfig[ord.status] || {
              label: ord.status,
              badge: 'bg-slate-800 text-slate-300 border-slate-700',
            };
            const dateStr = new Date(ord.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={ord.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-750 rounded-2xl p-4 sm:p-5 transition-all space-y-4"
              >
                {/* Header card: Number, Status & Time */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-black text-white">
                      #{ord.orderNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-semibold">
                      <StoreIcon className="w-3 h-3" />
                      <span>Retirada no Balcão</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(ord.createdAt).toLocaleDateString()} às {dateStr}</span>
                  </div>
                </div>

                {/* Customer & Items */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Col 1: Customer */}
                  <div className="space-y-1">
                    <div className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                      Cliente
                    </div>
                    <div className="font-extrabold text-white text-sm">
                      {ord.customerName}
                    </div>
                    <div className="text-slate-300 font-mono">
                      {ord.customerPhone}
                    </div>
                  </div>

                  {/* Col 2: Order Items */}
                  <div className="space-y-1.5 md:col-span-1">
                    <div className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                      Itens do Pedido ({ord.items.reduce((acc, i) => acc + i.quantity, 0)})
                    </div>
                    <div className="space-y-1">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-slate-200">
                          <span>
                            <strong className="text-amber-400">{it.quantity}x</strong> {it.productName}
                          </span>
                          <span className="font-mono text-slate-400">
                            R$ {it.totalPrice.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      ))}
                    </div>
                    {ord.customerNotes && (
                      <p className="text-[11px] text-amber-300/90 italic bg-amber-500/5 p-2 rounded-lg border border-amber-500/20 mt-1">
                        Obs: "{ord.customerNotes}"
                      </p>
                    )}
                  </div>

                  {/* Col 3: Payment & Total */}
                  <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal:</span>
                      <span className="font-mono text-slate-200">
                        R$ {ord.subtotal.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm font-black text-white pt-1 border-t border-slate-800">
                      <span>Total:</span>
                      <span className="text-amber-400">
                        R$ {ord.total.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                      <span>Pagamento:</span>
                      <span className="uppercase font-bold text-slate-200">
                        {ord.paymentMethod.replace('_', ' ')}
                      </span>
                    </div>
                    {ord.paymentMethod === 'dinheiro' && ord.changeFor && (
                      <div className="text-[10px] text-amber-400 flex justify-between">
                        <span>Troco para:</span>
                        <span className="font-mono font-bold">
                          R$ {ord.changeFor.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions bottom bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    {/* Status Changer */}
                    <span className="text-xs text-slate-400 font-semibold">Alterar Status:</span>
                    <select
                      value={ord.status}
                      onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                      className="bg-slate-950 border border-slate-750 text-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold focus:outline-none focus:border-amber-500"
                    >
                      <option value="novo">Novo</option>
                      <option value="confirmado">Confirmado</option>
                      <option value="preparando">Em Preparação</option>
                      <option value="pronto_retirada">Pronto para Retirada</option>
                      <option value="finalizado">Finalizado no Balcão</option>
                      <option value="cancelado">Cancelado / Estornado</option>
                    </select>

                    {/* Quick Next Step Button */}
                    {cfg.next && cfg.nextLabel && (
                      <button
                        onClick={() => updateOrderStatus(ord.id, cfg.next!)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                      >
                        {cfg.nextLabel}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Update on WhatsApp */}
                    <a
                      href={generateStatusMessageWhatsApp(ord, ord.status)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-bold transition-all"
                      title="Notificar cliente sobre o status atual no WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Avisar no WhatsApp</span>
                    </a>

                    {/* Delete order (with confirm) */}
                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir o Pedido #${ord.orderNumber}?`)) {
                          deleteOrder(ord.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Excluir Registro de Pedido"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
