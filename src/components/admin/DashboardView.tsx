import React from 'react';
import { useStore } from '../../services/storeContext';
import {
  ShoppingBag,
  DollarSign,
  Package,
  Flame,
  Clock,
  ArrowUpRight,
  TrendingUp,
  MessageCircle,
  Truck
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const { orders, products, store, updateOrderStatus, generateWhatsAppLink } = useStore();

  const totalRevenue = orders.reduce((acc, o) => acc + (o.status !== 'cancelado' ? o.total : 0), 0);
  const activeProducts = products.filter((p) => p.isActive);
  const promoProducts = products.filter((p) => p.isPromo);
  const recentOrders = orders.slice(0, 5);

  // Group orders for simulated sales chart
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const chartData = [
    { day: 'Seg', val: 420 },
    { day: 'Ter', val: 680 },
    { day: 'Qua', val: 890 },
    { day: 'Qui', val: 1420 },
    { day: 'Sex', val: 2890 },
    { day: 'Sáb', val: 3450 },
    { day: 'Dom', val: 2150 },
  ];
  const maxVal = Math.max(...chartData.map((d) => d.val));

  const statusColors = {
    novo: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    confirmado: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    preparando: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    saiu_entrega: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    entregue: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    cancelado: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  };

  const statusLabels = {
    novo: 'Novo',
    confirmado: 'Confirmado',
    preparando: 'Preparando',
    saiu_entrega: 'A Caminho',
    entregue: 'Entregue',
    cancelado: 'Cancelado',
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Painel Geral da Loja — {store.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Resumo em tempo real de vendas, catálogo e pedidos em andamento
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('orders')}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Gerenciar Pedidos
          </button>
          <button
            onClick={() => onNavigateTab('products')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            + Novo Produto
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Revenue */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Valor Vendido Total</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            R$ {totalRevenue.toFixed(2).replace('.', ',')}
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" />
            +18.4% vs semana anterior
          </p>
        </div>

        {/* Orders Today */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Pedidos na Loja</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {orders.length}
          </div>
          <p className="text-[11px] text-slate-400">
            {orders.filter((o) => o.status === 'novo').length} aguardando separação
          </p>
        </div>

        {/* Active Products */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Produtos Ativos</span>
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {activeProducts.length} <span className="text-xs text-slate-500 font-normal">/ {products.length}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Disponíveis no cardápio público
          </p>
        </div>

        {/* On Promo */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Ofertas & Promoções</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {promoProducts.length}
          </div>
          <p className="text-[11px] text-rose-400 font-semibold">
            Itens com desconto ativo
          </p>
        </div>
      </div>

      {/* Interactive Sales Chart & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Faturamento Semanal (R$)
              </h3>
              <p className="text-xs text-slate-400">Picos nos fins de semana e esquentas</p>
            </div>
            <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
              Total Semana: R$ 11.480,00
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2">
            {chartData.map((bar) => {
              const heightPct = Math.round((bar.val / maxVal) * 100);
              return (
                <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {bar.val}
                  </span>
                  <div className="w-full bg-slate-800 rounded-t-lg h-36 flex items-end p-1">
                    <div
                      className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-md group-hover:from-amber-500 group-hover:to-amber-300 transition-all duration-300"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-amber-400 transition-colors">
                    {bar.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Status */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white">
              Status da Operação
            </h3>
            <p className="text-xs text-slate-400 mt-1">Configurações rápidas de funcionamento</p>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300 font-medium">Tempo médio de entrega:</span>
                <span className="text-amber-400 font-bold">{store.estimatedDeliveryTime}</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300 font-medium">Taxa padrão de entrega:</span>
                <span className="text-white font-bold">R$ {store.defaultDeliveryFee.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300 font-medium">Frete Grátis acima de:</span>
                <span className="text-emerald-400 font-bold">R$ {store.freeDeliveryOver.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300 font-medium">Chave PIX ativa:</span>
                <span className="text-slate-200 font-mono text-[11px] truncate max-w-[140px]">{store.payments.pixKey}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('delivery')}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
          >
            Ajustar Regras de Delivery
          </button>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-white">
              Últimos Pedidos Recebidos
            </h3>
            <p className="text-xs text-slate-400">Clique para mudar status ou contatar no WhatsApp</p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1"
          >
            <span>Ver todos ({orders.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">Nenhum pedido registrado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3"># Pedido</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Itens</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Pagamento</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-3 font-bold text-white font-mono">
                      #{ord.orderNumber}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-200">{ord.customerName}</div>
                      <div className="text-[10px] text-slate-400">{ord.customerPhone}</div>
                    </td>
                    <td className="p-3 max-w-[180px] truncate text-slate-400">
                      {ord.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                    </td>
                    <td className="p-3 font-black text-amber-400">
                      R$ {ord.total.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="p-3 uppercase text-[10px] font-bold">
                      {ord.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="p-3">
                      <select
                        value={ord.status}
                        onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none ${statusColors[ord.status]}`}
                      >
                        <option value="novo" className="bg-slate-900 text-white">Novo</option>
                        <option value="confirmado" className="bg-slate-900 text-white">Confirmado</option>
                        <option value="preparando" className="bg-slate-900 text-white">Preparando</option>
                        <option value="saiu_entrega" className="bg-slate-900 text-white">Saiu para Entrega</option>
                        <option value="entregue" className="bg-slate-900 text-white">Entregue</option>
                        <option value="cancelado" className="bg-slate-900 text-white">Cancelado</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <a
                        href={generateWhatsAppLink(ord)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
