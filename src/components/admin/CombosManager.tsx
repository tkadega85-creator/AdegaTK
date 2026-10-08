import React, { useState } from 'react';
import { useStore } from '../../services/storeContext';
import { Combo } from '../../types';
import { Plus, Edit2, Trash2, Check, X, Sparkles, Image as ImageIcon } from 'lucide-react';

export const CombosManager: React.FC = () => {
  const { combos, addCombo, updateCombo, deleteCombo } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [originalPrice, setOriginalPrice] = useState('199.90');
  const [promoPrice, setPromoPrice] = useState('169.90');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(true);

  // Included items
  const [includedItems, setIncludedItems] = useState<string[]>([]);
  const [newItemInput, setNewItemInput] = useState('');

  const handleOpenAdd = () => {
    setEditingCombo(null);
    setName('');
    setDescription('');
    setOriginalPrice('199.90');
    setPromoPrice('169.90');
    setImageUrl('https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=800&auto=format&fit=crop&q=80');
    setIsActive(true);
    setIsFeatured(true);
    setIncludedItems(['1x Garrafa Whisky 1L', '4x Energéticos 250ml', '1x Gelo 5kg']);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (combo: Combo) => {
    setEditingCombo(combo);
    setName(combo.name);
    setDescription(combo.description);
    setOriginalPrice(combo.originalPrice.toString());
    setPromoPrice(combo.promoPrice.toString());
    setImageUrl(combo.imageUrl);
    setIsActive(combo.isActive);
    setIsFeatured(combo.isFeatured || false);
    setIncludedItems([...combo.includedItems]);
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    if (!newItemInput.trim()) return;
    setIncludedItems((prev) => [...prev, newItemInput.trim()]);
    setNewItemInput('');
  };

  const handleRemoveItem = (index: number) => {
    setIncludedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      description: description.trim(),
      originalPrice: parseFloat(originalPrice.replace(',', '.')) || 0,
      promoPrice: parseFloat(promoPrice.replace(',', '.')) || 0,
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=800&auto=format&fit=crop&q=80',
      includedItems: includedItems.length > 0 ? includedItems : ['1x Combo Especial'],
      isActive,
      isFeatured,
    };

    if (editingCombo) {
      updateCombo(editingCombo.id, payload);
    } else {
      addCombo(payload);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Combos & Kits Especiais
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Crie pacotes combinados com descontos imperdíveis para aumentar seu ticket médio
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Novo Combo</span>
        </button>
      </div>

      {/* Grid of combos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {combos.map((c) => {
          const discount = Math.round(((c.originalPrice - c.promoPrice) / c.originalPrice) * 100);

          return (
            <div
              key={c.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                c.isActive
                  ? 'bg-slate-900 border-slate-800 hover:border-amber-500/40'
                  : 'bg-slate-950/60 border-slate-850 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex gap-3">
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-800 bg-slate-950 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-white text-base truncate">
                        {c.name}
                      </h3>
                      {c.isFeatured && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-1.5 py-0.5 rounded shrink-0">
                          Destaque
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                      {c.description}
                    </p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-sm font-black text-amber-400">
                        R$ {c.promoPrice.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-xs text-slate-500 line-through">
                        R$ {c.originalPrice.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-[10px] font-bold text-rose-400">
                        (-{discount}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items checklist */}
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Itens Inclusos:
                  </span>
                  {c.includedItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-300">
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => updateCombo(c.id, { isActive: !c.isActive })}
                  className={`text-[11px] font-bold px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    c.isActive
                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {c.isActive ? 'Disponível no Site' : 'Pausado'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir combo "${c.name}"?`)) {
                        deleteCombo(c.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Combo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-750 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-extrabold text-base text-white">
                {editingCombo ? 'Editar Combo' : 'Novo Combo'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs text-slate-200">
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Nome do Combo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Combo Sextou Jack Daniel's"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Descrição Comercial
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: O combo completo para animar a resenha com os amigos..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Preço Original (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="220.00"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-rose-400 block mb-1">
                    Preço Promocional (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="189.90"
                    value={promoPrice}
                    onChange={(e) => setPromoPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  URL da Imagem do Combo
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                />
              </div>

              {/* Items included builder */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <label className="font-bold text-amber-400 block">
                  Itens Inclusos no Pacote:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: 1x Whisky Red Label 1L"
                    value={newItemInput}
                    onChange={(e) => setNewItemInput(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    + Adicionar
                  </button>
                </div>

                <div className="space-y-1 pt-1">
                  {includedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1 rounded-lg text-xs"
                    >
                      <span className="text-slate-200">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Disponível para Pedidos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Destaque na Página Inicial</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md"
                >
                  Salvar Combo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
