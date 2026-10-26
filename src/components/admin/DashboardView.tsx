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
  TrendingDown,
  MessageCircle,
  Store,
  Receipt
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const { orders, products, store, expenses, updateOrderStatus, generateWhatsAppLink, isStoreCurrentlyOpen } = useStore();

  const validOrders = orders.filter((o) => o.status !== 'cancelado');
  const grossRevenue = validOrders.reduce((acc, o) => acc + o.total, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const operatingResult = grossRevenue - totalExpenses;

  const activeProducts = products.filter((p) => p.isActive);
  const promoProducts = products.filter((p) => p.isPromo);
  const recentOrders = orders.slice(0, 5);

  // Group real orders by day of week for the past 7 days
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const now = new Date();
  
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(now.getDate() - (6 - i));
    const dayStr = d.toISOString().split('T')[0];
    const dayLabel = dayNames[d.getDay()];
    return { dateStr: dayStr, label: dayLabel };
  });

  const chartData = last7Days.map(({ dateStr, label }) => {
    const dayRevenue = orders
      .filter((o) => o.status !== 'cancelado' && o.createdAt && o.createdAt.startsWith(dateStr))
      .reduce((sum, o) => sum + o.total, 0);
    return { day: label, val: dayRevenue };
  });

  const weeklyRevenue = chartData.reduce((acc, c) => acc + c.val, 0);
  const maxVal = Math.max(...chartData.map((d) => d.val), 10);

  const statusColors: Record<string, string> = {
    novo: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    confirmado: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    preparando: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    pronto_retirada: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    finalizado: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    cancelado: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
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
            Resumo em tempo real de faturamento, despesas e pedidos no balcão
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('finances')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Painel Financeiro & DRE</span>
          </button>
          <button
            onClick={() => onNavigateTab('orders')}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Gerenciar Pedidos
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Revenue */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Faturamento Bruto</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            R$ {grossRevenue.toFixed(2).replace('.', ',')}
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" />
            {validOrders.length} pedido(s) confirmado(s)
          </p>
        </div>

        {/* Expenses */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total de Despesas</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-400">
            R$ {totalExpenses.toFixed(2).replace('.', ',')}
          </div>
          <p className="text-[11px] text-slate-400">
            {expenses.length} lançamento(s) registrado(s)
          </p>
        </div>

        {/* Operating Result */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Resultado Operacional</span>
            <div className={`p-2 rounded-xl ${operatingResult >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-black ${operatingResult >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            R$ {operatingResult.toFixed(2).replace('.', ',')}
          </div>
          <p className="text-[11px] text-slate-400">
            Receita líquida menos despesas
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
            Disponíveis no cardápio de balcão
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
              <p className="text-xs text-slate-400">Vendas dos últimos 7 dias</p>
            </div>
            <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
              Total Semana: R$ {weeklyRevenue.toFixed(2).replace('.', ',')}
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2">
            {chartData.map((bar) => {
              const heightPct = Math.round((bar.val / maxVal) * 100);
              return (
                <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    R$ {bar.val}
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

        {/* Operational Status Box */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white">
              Status Operacional
            </h3>
            <p className="text-xs text-slate-400 mt-1">Configurações de atendimento e balcão</p>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300 font-medium">Modalidade:</span>
                <span className="text-amber-400 font-bold">Retirada no Balcão</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300 font-medium">Status da Loja:</span>
                <span className={isStoreCurrentlyOpen ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {isStoreCurrentlyOpen ? 'Aberto Agora' : 'Fechado'}
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300 font-medium">Pedidos Novos:</span>
                <span className="text-white font-bold">{orders.filter((o) => o.status === 'novo').length} aguardando</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300 font-medium">Chave PIX configurada:</span>
                <span className="text-slate-200 font-mono text-[11px] truncate max-w-[140px]">{store.payments.pixKey || 'Não configurada'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('finances')}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-amber-400 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Consultar Painel Financeiro Completo</span>
          </button>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-white">
              Últimos Pedidos no Balcão
            </h3>
            <p className="text-xs text-slate-400">Clique para mudar status ou contatar no WhatsApp</p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Ver todos ({orders.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">Nenhum pedido registrado ainda no balcão.</p>
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
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none ${statusColors[ord.status] || 'bg-slate-800'}`}
                      >
                        <option value="novo" className="bg-slate-900 text-white">Novo</option>
                        <option value="confirmado" className="bg-slate-900 text-white">Confirmado</option>
                        <option value="preparando" className="bg-slate-900 text-white">Preparando</option>
                        <option value="pronto_retirada" className="bg-slate-900 text-white">Pronto para Retirada</option>
                        <option value="finalizado" className="bg-slate-900 text-white">Entregue no Balcão</option>
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
