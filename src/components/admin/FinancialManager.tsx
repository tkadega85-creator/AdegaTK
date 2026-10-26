import React, { useState, useMemo } from 'react';
import { useStore } from '../../services/storeContext';
import { Expense, ExpenseCategory, Order } from '../../types';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Receipt,
  CreditCard,
  QrCode,
  Banknote,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  PieChart,
  ArrowUpRight,
  Package
} from 'lucide-react';

export const FinancialManager: React.FC = () => {
  const {
    orders,
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    products,
    updateOrderStatus
  } = useStore();

  const [activeTab, setActiveTab] = useState<'resumo' | 'vendas' | 'despesas'>('resumo');
  const [periodFilter, setPeriodFilter] = useState<'hoje' | '7dias' | 'mes' | 'todos'>('mes');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');

  // Expense modal state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('Fornecedores');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseNotes, setExpenseNotes] = useState('');
  const [expenseError, setExpenseError] = useState('');

  // Date filtering logic
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const sevenDaysStr = sevenDaysAgo.toISOString().split('T')[0];

  const currentMonthPrefix = todayStr.substring(0, 7); // e.g. "2026-10"

  const filterByPeriod = (dateStr?: string) => {
    if (!dateStr) return false;
    const itemDate = dateStr.split('T')[0];
    if (periodFilter === 'hoje') return itemDate === todayStr;
    if (periodFilter === '7dias') return itemDate >= sevenDaysStr;
    if (periodFilter === 'mes') return itemDate.startsWith(currentMonthPrefix);
    return true; // 'todos'
  };

  // Filtered Orders
  const periodOrders = useMemo(() => {
    return orders.filter((o) => filterByPeriod(o.createdAt));
  }, [orders, periodFilter]);

  // Valid orders (not cancelled)
  const validOrders = useMemo(() => {
    return periodOrders.filter((o) => o.status !== 'cancelado');
  }, [periodOrders]);

  // Cancelled / Refunded orders
  const cancelledOrders = useMemo(() => {
    return periodOrders.filter((o) => o.status === 'cancelado');
  }, [periodOrders]);

  // Filtered Expenses
  const periodExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesPeriod = filterByPeriod(e.date);
      const matchesCat = categoryFilter === 'todos' || e.category === categoryFilter;
      return matchesPeriod && matchesCat;
    });
  }, [expenses, periodFilter, categoryFilter]);

  // KPI Calculations
  const grossRevenue = useMemo(() => {
    return validOrders.reduce((acc, o) => acc + (o.total || 0), 0);
  }, [validOrders]);

  const cancelledTotal = useMemo(() => {
    return cancelledOrders.reduce((acc, o) => acc + (o.total || 0), 0);
  }, [cancelledOrders]);

  const discountsTotal = useMemo(() => {
    return validOrders.reduce((acc, o) => acc + (o.discount || 0), 0);
  }, [validOrders]);

  const netSalesRevenue = grossRevenue; // Net after cancellations

  const totalExpenses = useMemo(() => {
    return periodExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  }, [periodExpenses]);

  // Estimated Operational Profit
  const estimatedOperatingResult = netSalesRevenue - totalExpenses;

  // CMV (Custo das Mercadorias Vendidas) calculation if products have costPrice
  const { totalCMV, hasAnyCostRegistered } = useMemo(() => {
    let cmvSum = 0;
    let registeredCount = 0;
    for (const ord of validOrders) {
      for (const item of ord.items) {
        const prod = products.find((p) => p.id === item.productId);
        if (prod && typeof prod.costPrice === 'number' && prod.costPrice > 0) {
          cmvSum += prod.costPrice * item.quantity;
          registeredCount++;
        }
      }
    }
    return { totalCMV: cmvSum, hasAnyCostRegistered: registeredCount > 0 };
  }, [validOrders, products]);

  // Payment methods breakdown
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {
      pix: { count: 0, total: 0 },
      dinheiro: { count: 0, total: 0 },
      cartao_credito: { count: 0, total: 0 },
      cartao_debito: { count: 0, total: 0 },
    };
    for (const ord of validOrders) {
      const pm = ord.paymentMethod || 'pix';
      if (!map[pm]) {
        map[pm] = { count: 0, total: 0 };
      }
      map[pm].count += 1;
      map[pm].total += ord.total;
    }
    return map;
  }, [validOrders]);

  // Best selling products in period
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};
    for (const ord of validOrders) {
      for (const item of ord.items) {
        if (!map[item.productId]) {
          map[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
        }
        map[item.productId].qty += item.quantity;
        map[item.productId].revenue += item.totalPrice;
      }
    }
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 8);
  }, [validOrders]);

  // Expense Categories Available
  const expenseCategories: ExpenseCategory[] = [
    'Fornecedores',
    'Aluguel',
    'Energia/Água',
    'Funcionários',
    'Embalagens',
    'Manutenção',
    'Outros',
  ];

  // Open Expense Modal
  const handleOpenAddExpense = () => {
    setEditingExpense(null);
    setExpenseDesc('');
    setExpenseCategory('Fornecedores');
    setExpenseAmount('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setExpenseNotes('');
    setExpenseError('');
    setIsExpenseModalOpen(true);
  };

  const handleOpenEditExpense = (exp: Expense) => {
    setEditingExpense(exp);
    setExpenseDesc(exp.description);
    setExpenseCategory(exp.category);
    setExpenseAmount(exp.amount.toString());
    setExpenseDate(exp.date);
    setExpenseNotes(exp.notes || '');
    setExpenseError('');
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpenseError('');
    if (!expenseDesc.trim()) {
      setExpenseError('Por favor, informe a descrição da despesa.');
      return;
    }
    const parsedAmount = parseFloat(expenseAmount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setExpenseError('Por favor, informe um valor monetário positivo válido.');
      return;
    }

    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, {
          description: expenseDesc.trim(),
          category: expenseCategory,
          amount: parsedAmount,
          date: expenseDate,
          notes: expenseNotes.trim(),
        });
      } else {
        await addExpense({
          description: expenseDesc.trim(),
          category: expenseCategory,
          amount: parsedAmount,
          date: expenseDate,
          notes: expenseNotes.trim(),
        });
      }
      setIsExpenseModalOpen(false);
    } catch {
      setExpenseError('Erro ao salvar despesa. Tente novamente.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Painel Financeiro & Vendas Real</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Gestão Financeira & Despesas
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Controle de faturamento bruto, cancelamentos, custos operacionais e resultado líquido real
          </p>
        </div>

        {/* Global Period Filter */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          {(['hoje', '7dias', 'mes', 'todos'] as const).map((p) => {
            const labels = { hoje: 'Hoje', '7dias': '7 Dias', mes: 'Este Mês', todos: 'Geral' };
            const isActive = periodFilter === p;
            return (
              <button
                key={p}
                onClick={() => setPeriodFilter(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {labels[p]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('resumo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'resumo'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Resumo DRE Estimado</span>
        </button>

        <button
          onClick={() => setActiveTab('vendas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'vendas'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Vendas & Faturamento ({validOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('despesas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'despesas'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>Despesas & Gastos ({periodExpenses.length})</span>
        </button>
      </div>

      {/* TAB 1: RESUMO FINANCEIRO (DRE) */}
      {activeTab === 'resumo' && (
        <div className="space-y-6">
          {/* Main KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Faturamento Bruto */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold">Faturamento Bruto</span>
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white">
                R$ {grossRevenue.toFixed(2).replace('.', ',')}
              </div>
              <p className="text-[11px] text-slate-400">
                {validOrders.length} pedido(s) confirmado(s)
              </p>
            </div>

            {/* Cancelamentos / Estornos */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold">Cancelamentos & Estornos</span>
                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
                  <XCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-400">
                R$ {cancelledTotal.toFixed(2).replace('.', ',')}
              </div>
              <p className="text-[11px] text-slate-400">
                {cancelledOrders.length} pedido(s) cancelado(s)
              </p>
            </div>

            {/* Total Despesas */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold">Total de Despesas</span>
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-400">
                R$ {totalExpenses.toFixed(2).replace('.', ',')}
              </div>
              <p className="text-[11px] text-slate-400">
                {periodExpenses.length} despesa(s) registrada(s)
              </p>
            </div>

            {/* Resultado Operacional Estimado */}
            <div className={`border p-5 rounded-2xl space-y-2 ${
              estimatedOperatingResult >= 0
                ? 'bg-emerald-950/20 border-emerald-800/50'
                : 'bg-rose-950/20 border-rose-800/50'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Resultado Operacional</span>
                <div className={`p-2 rounded-xl ${
                  estimatedOperatingResult >= 0
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-rose-500/10 text-rose-400'
                }`}>
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-2xl font-black ${
                estimatedOperatingResult >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                R$ {estimatedOperatingResult.toFixed(2).replace('.', ',')}
              </div>
              <p className="text-[11px] text-slate-400">
                Receita líquida menos despesas
              </p>
            </div>
          </div>

          {/* Detailed Financial Summary Table (DRE) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <h2 className="font-black text-base text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-500" />
              <span>Demonstrativo do Resultado no Período Selecionado</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Conta / Indicador</th>
                    <th className="p-3">Qtd / Base</th>
                    <th className="p-3 text-right">Valor Total (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  <tr className="hover:bg-slate-850/40">
                    <td className="p-3 font-semibold text-white">
                      (+) Faturamento Bruto de Vendas
                    </td>
                    <td className="p-3 text-slate-400">{validOrders.length} pedido(s)</td>
                    <td className="p-3 text-right font-bold text-emerald-400">
                      R$ {grossRevenue.toFixed(2).replace('.', ',')}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-850/40">
                    <td className="p-3 text-slate-300">
                      (-) Cancelamentos e Estornos
                    </td>
                    <td className="p-3 text-slate-400">{cancelledOrders.length} pedido(s)</td>
                    <td className="p-3 text-right font-semibold text-rose-400">
                      - R$ {cancelledTotal.toFixed(2).replace('.', ',')}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-850/40">
                    <td className="p-3 text-slate-300">
                      (-) Descontos Concedidos
                    </td>
                    <td className="p-3 text-slate-400">—</td>
                    <td className="p-3 text-right font-semibold text-slate-400">
                      - R$ {discountsTotal.toFixed(2).replace('.', ',')}
                    </td>
                  </tr>

                  <tr className="bg-slate-950/60 font-bold border-t border-b border-slate-800">
                    <td className="p-3 text-white">
                      (=) Receita Líquida de Vendas
                    </td>
                    <td className="p-3 text-slate-400">—</td>
                    <td className="p-3 text-right font-black text-white text-sm">
                      R$ {netSalesRevenue.toFixed(2).replace('.', ',')}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-850/40">
                    <td className="p-3 text-slate-300">
                      (-) Custo das Mercadorias Vendidas (CMV)
                    </td>
                    <td className="p-3 text-slate-400">
                      {hasAnyCostRegistered ? 'Itens com custo cadastrado' : 'Custos não cadastrados'}
                    </td>
                    <td className="p-3 text-right font-semibold text-amber-400">
                      {hasAnyCostRegistered ? `- R$ ${totalCMV.toFixed(2).replace('.', ',')}` : 'R$ 0,00 *'}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-850/40">
                    <td className="p-3 text-slate-300">
                      (-) Despesas Operacionais Registradas
                    </td>
                    <td className="p-3 text-slate-400">{periodExpenses.length} lançamento(s)</td>
                    <td className="p-3 text-right font-semibold text-rose-400">
                      - R$ {totalExpenses.toFixed(2).replace('.', ',')}
                    </td>
                  </tr>

                  <tr className="bg-slate-950 font-black border-t-2 border-slate-800 text-sm">
                    <td className="p-3.5 text-amber-400">
                      (=) Resultado Financeiro Estimado
                    </td>
                    <td className="p-3.5 text-slate-400 text-xs font-normal">
                      Saldo operacional apurado
                    </td>
                    <td className={`p-3.5 text-right font-black ${
                      estimatedOperatingResult >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      R$ {estimatedOperatingResult.toFixed(2).replace('.', ',')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Atenção Contábil:</strong> Faturamento não é lucro. O resultado financeiro apurado
                baseia-se exclusivamente nas receitas e despesas registradas no banco de dados. Caso o preço de custo dos produtos
                não tenha sido cadastrado individualmente, o CMV não reflete o custo real das mercadorias vendidas e o resultado deve ser considerado parcial.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VENDAS & FATURAMENTO */}
      {activeTab === 'vendas' && (
        <div className="space-y-6">
          {/* Payment Methods Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-500" />
              <span>Recebimentos por Forma de Pagamento</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>PIX</span>
                </div>
                <div className="text-base sm:text-lg font-black text-white">
                  R$ {paymentBreakdown.pix.total.toFixed(2).replace('.', ',')}
                </div>
                <span className="text-[10px] text-slate-400">{paymentBreakdown.pix.count} venda(s)</span>
              </div>

              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1">
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Dinheiro</span>
                </div>
                <div className="text-base sm:text-lg font-black text-white">
                  R$ {paymentBreakdown.dinheiro.total.toFixed(2).replace('.', ',')}
                </div>
                <span className="text-[10px] text-slate-400">{paymentBreakdown.dinheiro.count} venda(s)</span>
              </div>

              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold mb-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Cartão Crédito</span>
                </div>
                <div className="text-base sm:text-lg font-black text-white">
                  R$ {paymentBreakdown.cartao_credito.total.toFixed(2).replace('.', ',')}
                </div>
                <span className="text-[10px] text-slate-400">{paymentBreakdown.cartao_credito.count} venda(s)</span>
              </div>

              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold mb-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Cartão Débito</span>
                </div>
                <div className="text-base sm:text-lg font-black text-white">
                  R$ {paymentBreakdown.cartao_debito.total.toFixed(2).replace('.', ',')}
                </div>
                <span className="text-[10px] text-slate-400">{paymentBreakdown.cartao_debito.count} venda(s)</span>
              </div>
            </div>
          </div>

          {/* Top Products */}
          {topProducts.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-500" />
                <span>Produtos Mais Vendidos no Período</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {topProducts.map((p, idx) => (
                  <div key={p.name} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="truncate">
                        <div className="font-bold text-xs text-slate-100 truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.qty} unidades vendidas</div>
                      </div>
                    </div>
                    <div className="text-xs font-black text-amber-400 shrink-0 pl-2">
                      R$ {p.revenue.toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complete Sales Log Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-500" />
              <span>Histórico de Vendas Real ({periodOrders.length})</span>
            </h3>

            {periodOrders.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Nenhuma venda registrada no período selecionado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3"># Pedido</th>
                      <th className="p-3">Data/Hora</th>
                      <th className="p-3">Cliente</th>
                      <th className="p-3">Itens</th>
                      <th className="p-3">Forma Pagamento</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Total</th>
                      <th className="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {periodOrders.map((ord) => {
                      const isCancelled = ord.status === 'cancelado';
                      return (
                        <tr key={ord.id} className={`hover:bg-slate-850/40 ${isCancelled ? 'opacity-60 bg-rose-950/10' : ''}`}>
                          <td className="p-3 font-mono font-bold text-white">#{ord.orderNumber}</td>
                          <td className="p-3 text-slate-400 text-[11px]">
                            {new Date(ord.createdAt).toLocaleDateString()} {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-200">{ord.customerName}</span>
                            <div className="text-[10px] text-slate-500">{ord.customerPhone}</div>
                          </td>
                          <td className="p-3 max-w-[200px] truncate text-slate-300">
                            {ord.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                          </td>
                          <td className="p-3 uppercase text-[10px] font-bold text-slate-300">
                            {ord.paymentMethod.replace('_', ' ')}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              isCancelled
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            }`}>
                              {ord.status}
                            </span>
                          </td>
                          <td className={`p-3 text-right font-black ${isCancelled ? 'line-through text-slate-500' : 'text-amber-400'}`}>
                            R$ {ord.total.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="p-3 text-right">
                            {!isCancelled ? (
                              <button
                                onClick={() => {
                                  if (confirm(`Confirmar cancelamento/estorno do Pedido #${ord.orderNumber}?`)) {
                                    updateOrderStatus(ord.id, 'cancelado');
                                  }
                                }}
                                className="px-2 py-1 text-[10px] bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 rounded-lg cursor-pointer"
                                title="Cancelar / Estornar venda"
                              >
                                Cancelar / Estornar
                              </button>
                            ) : (
                              <span className="text-[10px] text-rose-400 italic">Estornado</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DESPESAS & GASTOS */}
      {activeTab === 'despesas' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl">
            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs text-slate-400 font-semibold shrink-0">Filtrar Categoria:</span>
              <button
                onClick={() => setCategoryFilter('todos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  categoryFilter === 'todos' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                Todas
              </button>
              {expenseCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    categoryFilter === cat ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={handleOpenAddExpense}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nova Despesa</span>
            </button>
          </div>

          {/* Expenses List Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-white">
                Lançamentos de Gastos ({periodExpenses.length})
              </h3>
              <div className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                Total Filtrado: R$ {totalExpenses.toFixed(2).replace('.', ',')}
              </div>
            </div>

            {periodExpenses.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Nenhuma despesa cadastrada no período selecionado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Data</th>
                      <th className="p-3">Descrição</th>
                      <th className="p-3">Categoria</th>
                      <th className="p-3">Observações</th>
                      <th className="p-3 text-right">Valor</th>
                      <th className="p-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {periodExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-850/40">
                        <td className="p-3 font-mono text-slate-400 text-[11px]">{exp.date}</td>
                        <td className="p-3 font-semibold text-slate-100">{exp.description}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {exp.category}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 text-[11px]">{exp.notes || '—'}</td>
                        <td className="p-3 text-right font-black text-rose-400">
                          R$ {exp.amount.toFixed(2).replace('.', ',')}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditExpense(exp)}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Excluir despesa "${exp.description}"?`)) {
                                  deleteExpense(exp.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expense Modal (Add / Edit) */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-750 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-extrabold text-base text-white">
                {editingExpense ? 'Editar Despesa' : 'Cadastrar Nova Despesa'}
              </h2>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {expenseError && (
              <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-xs text-rose-300 font-semibold">
                {expenseError}
              </div>
            )}

            <form onSubmit={handleSaveExpense} className="space-y-4 text-xs text-slate-200">
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Descrição do Gasto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Compra de Cerveja Heineken (Distribuidora)"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Categoria *
                  </label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  >
                    {expenseCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 850.00"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Data da Despesa *
                </label>
                <input
                  type="date"
                  required
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Observações / Nota Fiscal (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Número de nota, fornecedor, vencimento..."
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md"
                >
                  Salvar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
