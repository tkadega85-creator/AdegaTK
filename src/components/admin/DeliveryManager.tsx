import React, { useState } from 'react';
import { useStore } from '../../services/storeContext';
import { DeliveryZone } from '../../types';
import { Truck, Plus, Trash2, Edit2, Check, Clock, DollarSign, ShieldAlert } from 'lucide-react';

export const DeliveryManager: React.FC = () => {
  const { store, updateStore, deliveryZones, addDeliveryZone, updateDeliveryZone, deleteDeliveryZone } = useStore();

  // General settings state
  const [minOrder, setMinOrder] = useState(store.minOrderValue.toString());
  const [freeOver, setFreeOver] = useState(store.freeDeliveryOver.toString());
  const [defaultFee, setDefaultFee] = useState(store.defaultDeliveryFee.toString());
  const [estTime, setEstTime] = useState(store.estimatedDeliveryTime);
  const [savedSettingsSuccess, setSavedSettingsSuccess] = useState(false);

  // New zone state
  const [newNeighborhood, setNewNeighborhood] = useState('');
  const [newFee, setNewFee] = useState('');
  const [newTime, setNewTime] = useState('30 - 45 min');

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateStore({
      minOrderValue: parseFloat(minOrder.replace(',', '.')) || 0,
      freeDeliveryOver: parseFloat(freeOver.replace(',', '.')) || 0,
      defaultDeliveryFee: parseFloat(defaultFee.replace(',', '.')) || 0,
      estimatedDeliveryTime: estTime.trim() || '30 - 45 min',
    });
    setSavedSettingsSuccess(true);
    setTimeout(() => setSavedSettingsSuccess(false), 2500);
  };

  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNeighborhood.trim()) return;
    const feeVal = parseFloat(newFee.replace(',', '.')) || 0;
    addDeliveryZone({
      neighborhood: newNeighborhood.trim(),
      fee: feeVal,
      estimatedTime: newTime.trim() || '30 - 45 min',
      isActive: true,
    });
    setNewNeighborhood('');
    setNewFee('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <h1 className="text-xl sm:text-2xl font-black text-white">
          Configurações de Delivery & Taxas
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Defina regras de frete grátis, pedido mínimo e valores de entrega para cada bairro atendido
        </p>
      </div>

      {/* General Delivery Rules Form */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-4">
        <h2 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
          <Truck className="w-4 h-4 text-amber-500" />
          <span>Regras Gerais de Entrega</span>
        </h2>

        <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs text-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Taxa de Entrega Padrão (R$)
              </label>
              <input
                type="text"
                value={defaultFee}
                onChange={(e) => setDefaultFee(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Frete Grátis Acima de (R$)
              </label>
              <input
                type="text"
                value={freeOver}
                onChange={(e) => setFreeOver(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Pedido Mínimo na Adega (R$)
              </label>
              <input
                type="text"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Tempo Estimado de Entrega
              </label>
              <input
                type="text"
                value={estTime}
                onChange={(e) => setEstTime(e.target.value)}
                placeholder="Ex: 30 - 45 min"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">
              Essas regras impactam diretamente o cálculo no checkout do cliente.
            </span>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md transition-colors cursor-pointer"
            >
              {savedSettingsSuccess ? 'Salvo com Sucesso!' : 'Salvar Regras Gerais'}
            </button>
          </div>
        </form>
      </div>

      {/* Neighborhood Delivery Zones Manager */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-4">
        <h2 className="font-extrabold text-sm sm:text-base text-white">
          Bairros e Regiões Atendidas ({deliveryZones.length})
        </h2>

        {/* Add new zone inline */}
        <form onSubmit={handleAddZone} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col sm:flex-row gap-2 text-xs">
          <input
            type="text"
            required
            placeholder="Nome do Bairro ou Região (ex: Vila Olímpia)"
            value={newNeighborhood}
            onChange={(e) => setNewNeighborhood(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <input
            type="text"
            required
            placeholder="Taxa R$ (ex: 8.50)"
            value={newFee}
            onChange={(e) => setNewFee(e.target.value)}
            className="w-28 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <input
            type="text"
            placeholder="Tempo (ex: 25-40 min)"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="w-32 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg transition-colors cursor-pointer shrink-0"
          >
            + Cadastrar Bairro
          </button>
        </form>

        {/* Zones Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Bairro / Região</th>
                <th className="p-3">Taxa de Entrega</th>
                <th className="p-3">Tempo Estimado</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {deliveryZones.map((z) => (
                <tr key={z.id} className="hover:bg-slate-850/40">
                  <td className="p-3 font-bold text-white">{z.neighborhood}</td>
                  <td className="p-3 font-black text-amber-400">
                    R$ {z.fee.toFixed(2).replace('.', ',')}
                  </td>
                  <td className="p-3 text-slate-400">{z.estimatedTime}</td>
                  <td className="p-3">
                    <button
                      onClick={() => updateDeliveryZone(z.id, { isActive: !z.isActive })}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        z.isActive
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {z.isActive ? 'Ativo' : 'Desativado'}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Remover bairro "${z.neighborhood}"?`)) {
                          deleteDeliveryZone(z.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
