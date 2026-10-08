import React, { useState } from 'react';
import { useStore } from '../../services/storeContext';
import { Category } from '../../types';
import { Plus, Edit2, Trash2, Check, X, ArrowUpDown, Tag } from 'lucide-react';

export const CategoriesManager: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, products } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🍺');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState('1');
  const [isActive, setIsActive] = useState(true);

  const popularEmojis = ['🍺', '🥃', '🍷', '🍸', '🥤', '🧃', '🧊', '🚬', '🍫', '🎁', '⭐', '🔥', '🍾', '🍖', '🥪'];

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setIcon('🍺');
    setDescription('');
    setOrder((categories.length + 1).toString());
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setIcon(cat.icon);
    setDescription(cat.description);
    setOrder(cat.order.toString());
    setIsActive(cat.isActive);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      icon: icon.trim() || '📦',
      description: description.trim(),
      order: parseInt(order) || 1,
      isActive,
    };

    if (editingCategory) {
      updateCategory(editingCategory.id, payload);
    } else {
      addCategory(payload);
    }
    setIsModalOpen(false);
  };

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Gerenciamento de Categorias
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Crie, reordene e personalize as seções do cardápio digital da adega
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedCategories.map((cat) => {
          const prodsCount = products.filter((p) => p.categoryId === cat.id).length;
          return (
            <div
              key={cat.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                cat.isActive
                  ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40'
                  : 'bg-slate-950/60 border-slate-850 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-slate-950 border border-slate-800">
                      {cat.icon}
                    </span>
                    <div>
                      <h3 className="font-bold text-white text-base">{cat.name}</h3>
                      <span className="text-[11px] text-slate-400">
                        {prodsCount} {prodsCount === 1 ? 'produto vinculado' : 'produtos vinculados'}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-amber-400 border border-slate-800">
                    #{cat.order}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                  {cat.description || 'Sem descrição cadastrada.'}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => updateCategory(cat.id, { isActive: !cat.isActive })}
                  className={`text-[11px] font-bold px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    cat.isActive
                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {cat.isActive ? 'Ativa no Cardápio' : 'Oculta'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Deseja realmente excluir a categoria "${cat.name}"? Ela possui ${prodsCount} produtos associados.`
                        )
                      ) {
                        deleteCategory(cat.id);
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

      {/* Modal Add / Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-750 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-extrabold text-base text-white">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs text-slate-200">
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Vinhos Selecionados"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Ícone / Emoji
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-16 text-center text-xl bg-slate-950 border border-slate-800 rounded-xl py-1.5 text-white focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400">
                    Selecione um emoji rápido abaixo ou digite qualquer caractere:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                  {popularEmojis.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setIcon(em)}
                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center hover:bg-slate-800 transition-colors cursor-pointer ${
                        icon === em ? 'bg-amber-500/20 border border-amber-500' : ''
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Descrição (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Whiskies escoceses, nacionais e licores finos"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    <span>Ativa no site</span>
                  </label>
                </div>
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
                  Salvar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
