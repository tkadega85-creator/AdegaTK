import React, { useState } from 'react';
import { useStore } from '../../services/storeContext';
import { Product, ProductVariant } from '../../types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Flame,
  Star,
  Check,
  X,
  Image as ImageIcon,
  Layers,
  Sparkles
} from 'lucide-react';

export const ProductsManager: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('10.00');
  const [promoPrice, setPromoPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [volumeOrWeight, setVolumeOrWeight] = useState('');
  const [inStock, setInStock] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isPromo, setIsPromo] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Variants editing state inside modal
  const [newVarName, setNewVarName] = useState('');
  const [newVarPrice, setNewVarPrice] = useState('');

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategoryFilter === 'all' || p.categoryId === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setDescription('');
    setPrice('10.00');
    setPromoPrice('');
    setImageUrl('https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80');
    setVolumeOrWeight('350ml');
    setInStock(true);
    setIsActive(true);
    setIsFeatured(false);
    setIsBestSeller(false);
    setIsPromo(false);
    setVariants([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategoryId(prod.categoryId);
    setDescription(prod.description);
    setPrice(prod.price.toString());
    setPromoPrice(prod.promoPrice ? prod.promoPrice.toString() : '');
    setImageUrl(prod.imageUrl);
    setVolumeOrWeight(prod.volumeOrWeight || '');
    setInStock(prod.inStock);
    setIsActive(prod.isActive);
    setIsFeatured(prod.isFeatured);
    setIsBestSeller(prod.isBestSeller);
    setIsPromo(prod.isPromo);
    setVariants(prod.variants ? [...prod.variants] : []);
    setIsModalOpen(true);
  };

  const handleAddVariant = () => {
    if (!newVarName.trim() || !newVarPrice.trim()) return;
    const vPrice = parseFloat(newVarPrice.replace(',', '.'));
    if (isNaN(vPrice)) return;
    const newV: ProductVariant = {
      id: `v-${Date.now()}`,
      name: newVarName.trim(),
      price: vPrice,
    };
    setVariants((prev) => [...prev, newV]);
    setNewVarName('');
    setNewVarPrice('');
  };

  const handleRemoveVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price.replace(',', '.')) || 0;
    const parsedPromo = promoPrice.trim() ? parseFloat(promoPrice.replace(',', '.')) : null;

    const payload = {
      name: name.trim(),
      categoryId,
      description: description.trim(),
      price: parsedPrice,
      promoPrice: parsedPromo,
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80',
      volumeOrWeight: volumeOrWeight.trim(),
      inStock,
      isActive,
      isFeatured,
      isBestSeller,
      isPromo: isPromo || (parsedPromo !== null && parsedPromo < parsedPrice),
      order: editingProduct ? editingProduct.order : products.length + 1,
      variants: variants.length > 0 ? variants : undefined,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
    } else {
      addProduct(payload);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Gerenciamento de Produtos
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cadastre bebidas, defina preços promocionais, variações e controle de estoque
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Produto</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome ou descrição..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
        >
          <option value="all">Todas as Categorias ({products.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({products.filter((p) => p.categoryId === c.id).length})
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Foto</th>
                <th className="p-3.5">Produto & Categoria</th>
                <th className="p-3.5">Preço Normal</th>
                <th className="p-3.5">Preço Promo</th>
                <th className="p-3.5">Destaques</th>
                <th className="p-3.5">Estoque</th>
                <th className="p-3.5">Visível</th>
                <th className="p-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500">
                    Nenhum produto encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const cat = categories.find((c) => c.id === prod.categoryId);
                  return (
                    <tr key={prod.id} className="hover:bg-slate-850/40 transition-colors">
                      <td className="p-3.5">
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-800 bg-slate-950 shrink-0"
                        />
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-white text-sm">{prod.name}</div>
                        <div className="text-[11px] text-amber-400 flex items-center gap-1 mt-0.5">
                          <span>{cat?.icon}</span>
                          <span>{cat?.name || 'Sem Categoria'}</span>
                          {prod.volumeOrWeight && (
                            <span className="text-slate-500">• {prod.volumeOrWeight}</span>
                          )}
                        </div>
                        {prod.variants && prod.variants.length > 0 && (
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            {prod.variants.length} opções cadastradas
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-bold text-slate-200">
                        R$ {prod.price.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="p-3.5">
                        {prod.promoPrice ? (
                          <span className="font-black text-rose-400 bg-rose-950/40 border border-rose-800/50 px-2 py-0.5 rounded text-[11px]">
                            R$ {prod.promoPrice.toFixed(2).replace('.', ',')}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {prod.isBestSeller && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                              Mais Vendido
                            </span>
                          )}
                          {prod.isFeatured && (
                            <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-bold">
                              Destaque
                            </span>
                          )}
                          {prod.isPromo && (
                            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-bold">
                              Promo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => updateProduct(prod.id, { inStock: !prod.inStock })}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                            prod.inStock
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/50'
                              : 'bg-rose-950/40 text-rose-400 border border-rose-800/50'
                          }`}
                        >
                          {prod.inStock ? 'Em Estoque' : 'Esgotado'}
                        </button>
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => updateProduct(prod.id, { isActive: !prod.isActive })}
                          className={`w-6 h-6 rounded flex items-center justify-center transition-colors cursor-pointer ${
                            prod.isActive
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                          title={prod.isActive ? 'Produto ativo no cardápio' : 'Produto oculto'}
                        >
                          {prod.isActive ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => duplicateProduct(prod.id)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Duplicar Produto"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja excluir "${prod.name}"?`)) {
                                deleteProduct(prod.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-750 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-4 max-h-[92vh]">
            <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-extrabold text-lg text-white">
                {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-slate-200">
              {/* Product Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Cerveja Heineken Lata 350ml"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">
                    Categoria *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">
                  Descrição do Produto
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalhes, notas de sabor, temperatura recomendada..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
                />
              </div>

              {/* Price, Promo Price, Volume */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">
                    Preço Normal (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 149.90"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-rose-400 font-semibold block mb-1">
                    Preço Promocional (R$)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 129.90"
                    value={promoPrice}
                    onChange={(e) => setPromoPrice(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">
                    Volume / Peso
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 1L, 350ml, 5kg"
                    value={volumeOrWeight}
                    onChange={(e) => setVolumeOrWeight(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Image URL & Live Preview */}
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">
                  URL da Foto do Produto
                </label>
                <div className="flex gap-3 items-center">
                  <div className="relative flex-1">
                    <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-10 h-10 rounded-lg object-cover bg-slate-950 border border-slate-800"
                    />
                  )}
                </div>
              </div>

              {/* Variations builder */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Variações / Tamanhos (Opcional)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Ex: Lata, Garrafa, Pack</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nome da opção (ex: Long Neck 330ml)"
                    value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Preço R$"
                    value={newVarPrice}
                    onChange={(e) => setNewVarPrice(e.target.value)}
                    className="w-24 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    + Adicionar
                  </button>
                </div>

                {variants.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {variants.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1 rounded-lg text-xs"
                      >
                        <span className="text-slate-200">{v.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 font-bold">
                            R$ {v.price.toFixed(2).replace('.', ',')}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(v.id)}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Toggles and Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 p-2 bg-slate-950/40 rounded-xl border border-slate-800 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Em Estoque</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-slate-950/40 rounded-xl border border-slate-800 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Ativo no Site</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-slate-950/40 rounded-xl border border-slate-800 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Mais Vendido</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-slate-950/40 rounded-xl border border-slate-800 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Destaque</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
