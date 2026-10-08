import React, { useState } from 'react';
import { useStore } from '../../services/storeContext';
import { Order, OrderStatus } from '../../types';
import {
  ShoppingBag,
  MessageCircle,
  Truck,
  Store as StoreIcon,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Trash2,
  PlusCircle,
  ExternalLink
} from 'lucide-react';

export const OrdersManager: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    deleteOrder,
    generateWhatsAppLink,
    store,
    createOrder,
    cart,
    addToCart,
    products,
  } = useStore();

  const [activeTab, setActiveTab] = useState<string>('todos');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const statusList: { key: string; label: string; count: number }[] = [
    { key: 'todos', label: 'Todos', count: orders.length },
    { key: 'novo', label: 'Novos', count: orders.filter((o) => o.status === 'novo').length },
    { key: 'confirmado', label: 'Confirmados', count: orders.filter((o) => o.status === 'confirmado').length },
    { key: 'preparando', label: 'Em Preparo', count: orders.filter((o) => o.status === 'preparando').length },
    { key: 'saiu_entrega', label: 'A Caminho', count: orders.filter((o) => o.status === 'saiu_entrega').length },
    { key: 'entregue', label: 'Entregues', count: orders.filter((o) => o.status === 'entregue').length },
    { key: 'cancelado', label: 'Cancelados', count: orders.filter((o) => o.status === 'cancelado').length },
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
      next: 'saiu_entrega',
      nextLabel: 'Despachar com Motoboy',
    },
    saiu_entrega: {
      label: 'Saiu para Entrega',
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      next: 'entregue',
      nextLabel: 'Marcar como Entregue',
    },
    entregue: {
      label: 'Entregue com Sucesso',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    cancelado: {
      label: 'Cancelado',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
  };

  const generateStatusMessageWhatsApp = (order: Order, status: OrderStatus): string => {
    const cleanPhone = order.customerPhone.replace(/\D/g, '');
    let msg = `Olá, *${order.customerName}*! Aqui é da *${store.name}*.\n\n`;

    if (status === 'confirmado') {
      msg += `✅ Seu pedido *#${order.orderNumber}* foi *CONFIRMADO* e já está entrando em separação!\n\nLogo te avisamos quando o motoboy sair!`;
    } else if (status === 'saiu_entrega') {
      msg += `🛵💨 Seu pedido *#${order.orderNumber}* já *SAIU PARA ENTREGA*!\n\nTempo estimado: ~${store.estimatedDeliveryTime}. Fique atento ao interfone ou portão!`;
    } else if (status === 'entregue') {
      msg += `🎉 Seu pedido *#${order.orderNumber}* foi marcado como *ENTREGUE*!\n\nEsperamos que curta bastante! Qualquer coisa estamos à disposição. Saúde! 🍻`;
    } else {
      msg += `Atualização sobre o seu pedido *#${order.orderNumber}*: status alterado para *${statusConfig[status].label}*.`;
    }

    return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  // Fast test order simulator for admin demonstrations
  const handleSimulateTestOrder = () => {
    if (products.length === 0) return;
    const p1 = products[0];
    const p2 = products[1] || products[0];
    addToCart(p1, undefined, 2);
    addToCart(p2, undefined, 1);

    setTimeout(() => {
      createOrder({
        customerName: 'Cliente Teste Simulado',
        customerPhone: '(11) 98888-7777',
        deliveryType: 'delivery',
        address: {
          street: 'Av. Paulista',
          number: '1000',
          neighborhood: 'Bela Vista',
        },
        paymentMethod: 'pix',
        deliveryFee: 8.0,
        customerNotes: 'Pedido teste para verificar alerta e notificações do painel',
      });
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Gerenciamento de Pedidos
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Controle os pedidos em tempo real desde a chegada até a entrega final
          </p>
        </div>
        <button
          onClick={handleSimulateTestOrder}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-amber-400 border border-amber-500/30 font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Simular Novo Pedido Teste</span>
        </button>
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
            const cfg = statusConfig[ord.status];
            const dateStr = new Date(ord.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={ord.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-750 rounded-2xl p-4 sm:p-5 transition-all space-y-4"
              >
                {/* Top Row: Order ID, Client, Date, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-lg text-white">
                      #{ord.orderNumber}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {dateStr}
                    </span>
                  </div>

                  {/* Customer Quick contact */}
                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs">
                      <div className="font-bold text-slate-200">{ord.customerName}</div>
                      <div className="text-[11px] text-slate-400">{ord.customerPhone}</div>
                    </div>
                    <a
                      href={generateWhatsAppLink(ord)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors"
                      title="Abrir no WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Middle: Items List & Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Items */}
                  <div className="md:col-span-2 space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Itens do Pedido ({ord.items.length}):
                    </span>
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-300">
                        <span>
                          <strong className="text-amber-400">{it.quantity}x</strong> {it.productName}
                          {it.notes && <span className="text-slate-500 italic ml-1">({it.notes})</span>}
                        </span>
                        <span className="font-mono text-slate-400">
                          R$ {it.totalPrice.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    ))}
                    {ord.customerNotes && (
                      <div className="mt-2 pt-2 border-t border-slate-800 text-amber-300/90 italic">
                        Obs: "{ord.customerNotes}"
                      </div>
                    )}
                  </div>

                  {/* Delivery & Payment Info */}
                  <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                    <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                      {ord.deliveryType === 'delivery' ? (
                        <>
                          <Truck className="w-3.5 h-3.5 text-amber-500" />
                          <span>Entrega Delivery</span>
                        </>
                      ) : (
                        <>
                          <StoreIcon className="w-3.5 h-3.5 text-sky-500" />
                          <span>Retirada no Balcão</span>
                        </>
                      )}
                    </div>

                    {ord.address && (
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {ord.address.street}, {ord.address.number}
                        {ord.address.complement && ` (${ord.address.complement})`}
                        <br />
                        {ord.address.neighborhood} - {ord.address.city}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-800 text-[11px] space-y-0.5">
                      <div className="flex justify-between text-slate-400">
                        <span>Pagamento:</span>
                        <span className="text-slate-200 uppercase font-bold">
                          {ord.paymentMethod.replace('_', ' ')}
                        </span>
                      </div>
                      {ord.changeFor && (
                        <div className="flex justify-between text-slate-400">
                          <span>Troco para:</span>
                          <span className="text-amber-400 font-bold">
                            R$ {ord.changeFor.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs font-black text-white pt-1">
                        <span>Total:</span>
                        <span className="text-amber-400 text-sm">
                          R$ {ord.total.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: Next Status Button & Status Selector */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Alterar Status:</span>
                    <select
                      value={ord.status}
                      onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="novo">Novo</option>
                      <option value="confirmado">Confirmado</option>
                      <option value="preparando">Em Preparo</option>
                      <option value="saiu_entrega">Saiu para Entrega</option>
                      <option value="entregue">Entregue</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Notify client on WhatsApp button */}
                    <a
                      href={generateStatusMessageWhatsApp(ord, ord.status)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                      title="Enviar aviso de status no WhatsApp do cliente"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Avisar Cliente</span>
                    </a>

                    {/* Next step quick advance */}
                    {cfg.next && (
                      <button
                        onClick={() => {
                          updateOrderStatus(ord.id, cfg.next!);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{cfg.nextLabel}</span>
                      </button>
                    )}

                    {/* Delete order */}
                    <button
                      onClick={() => {
                        if (confirm(`Excluir pedido #${ord.orderNumber}?`)) {
                          deleteOrder(ord.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Excluir Pedido"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
