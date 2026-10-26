import React, { useState, useRef } from 'react';
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
  Sparkles,
  Upload,
  Link as LinkIcon,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { storage } from '../../services/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

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
  const [price, setPrice] = useState('');
  const [promoPrice, setPromoPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [volumeOrWeight, setVolumeOrWeight] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [inStock, setInStock] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isPromo, setIsPromo] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Photo mode: 'url' or 'upload'
  const [photoMode, setPhotoMode] = useState<'url' | 'upload'>('url');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setPrice('');
    setPromoPrice('');
    setCostPrice('');
    setImageUrl('');
    setVolumeOrWeight('');
    setStockQuantity('');
    setInStock(true);
    setIsActive(true);
    setIsFeatured(false);
    setIsBestSeller(false);
    setIsPromo(false);
    setVariants([]);
    setPhotoError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategoryId(prod.categoryId);
    setDescription(prod.description);
    setPrice(prod.price.toString());
    setPromoPrice(prod.promoPrice ? prod.promoPrice.toString() : '');
    setCostPrice(prod.costPrice !== undefined && prod.costPrice !== null ? prod.costPrice.toString() : '');
    setImageUrl(prod.imageUrl || '');
    setVolumeOrWeight(prod.volumeOrWeight || '');
    setStockQuantity(prod.stockQuantity !== undefined ? prod.stockQuantity.toString() : '');
    setInStock(prod.inStock);
    setIsActive(prod.isActive);
    setIsFeatured(prod.isFeatured);
    setIsBestSeller(prod.isBestSeller);
    setIsPromo(prod.isPromo);
    setVariants(prod.variants ? [...prod.variants] : []);
    setPhotoError('');
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

  // Image File Upload handler with dual fallback (Firebase Storage -> API upload)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setPhotoError('Formato de imagem inválido. Aceitos apenas JPEG, PNG ou WebP.');
      return;
    }

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setPhotoError('O arquivo selecionado é maior que 5MB. Reduza o tamanho da imagem.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // 1. Try Firebase Storage upload first
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const storagePath = `products/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              setUploadProgress(progress);
            },
            (error) => {
              console.warn('Firebase Storage direct upload error:', error);
              reject(error);
            },
            async () => {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              setImageUrl(downloadUrl);
              resolve();
            }
          );
        });
        setIsUploading(false);
        return;
      } catch (fbErr) {
        console.info('Falling back to local backend server upload proxy:', fbErr);
      }

      // 2. Fallback to local server upload endpoint
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: base64Data,
              filename: file.name,
              mimeType: file.type,
            }),
          });
          const json = await res.json();
          if (json.success && json.url) {
            setImageUrl(json.url);
          } else {
            setPhotoError(json.error || 'Falha ao processar upload da foto.');
          }
        } catch {
          setPhotoError('Erro de conexão ao enviar a imagem.');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setPhotoError('Erro inesperado durante o upload da foto.');
      setIsUploading(false);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price.replace(',', '.')) || 0;
    const parsedPromo = promoPrice.trim() ? parseFloat(promoPrice.replace(',', '.')) : null;
    const parsedCost = costPrice.trim() ? parseFloat(costPrice.replace(',', '.')) : null;
    const parsedStock = stockQuantity.trim() ? parseInt(stockQuantity.trim(), 10) : undefined;

    const payload = {
      name: name.trim(),
      categoryId,
      description: description.trim(),
      price: parsedPrice,
      promoPrice: parsedPromo,
      costPrice: parsedCost,
      imageUrl: imageUrl.trim(),
      volumeOrWeight: volumeOrWeight.trim(),
      stockQuantity: parsedStock !== undefined && !isNaN(parsedStock) ? Math.max(0, parsedStock) : undefined,
      inStock: inStock && (parsedStock === undefined || parsedStock > 0),
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
            Cadastre bebidas, cervejas geladas e controle preços de venda, estoque e custos
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Produto</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou descrição do produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Category selector */}
        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-amber-500 shrink-0"
        >
          <option value="all">Todas as Categorias ({products.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Foto</th>
                <th className="p-3.5">Produto</th>
                <th className="p-3.5">Categoria</th>
                <th className="p-3.5">Preço Venda</th>
                <th className="p-3.5">Preço Custo</th>
                <th className="p-3.5">Estoque</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Nenhum produto cadastrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const cat = categories.find((c) => c.id === p.categoryId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-850/40 transition-colors">
                      <td className="p-3.5">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-slate-800"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 text-lg">
                            🍾
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-white text-xs sm:text-sm">{p.name}</div>
                        {p.volumeOrWeight && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            {p.volumeOrWeight}
                          </span>
                        )}
                        {p.variants && p.variants.length > 0 && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-amber-400 font-semibold border border-slate-700">
                            {p.variants.length} opções
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-750">
                          {cat ? `${cat.icon} ${cat.name}` : 'Sem Categoria'}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold">
                        {p.isPromo && p.promoPrice ? (
                          <div>
                            <span className="text-rose-400">R$ {p.promoPrice.toFixed(2).replace('.', ',')}</span>
                            <span className="text-[10px] text-slate-500 line-through block">
                              R$ {p.price.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-200">R$ {p.price.toFixed(2).replace('.', ',')}</span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-400 font-mono">
                        {p.costPrice ? `R$ ${p.costPrice.toFixed(2).replace('.', ',')}` : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="p-3.5">
                        {p.stockQuantity !== undefined ? (
                          <span className={`font-mono font-bold ${p.stockQuantity > 5 ? 'text-emerald-400' : p.stockQuantity > 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {p.stockQuantity} un
                          </span>
                        ) : (
                          <span className="text-slate-500">Ilimitado</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.isActive ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {p.isActive ? 'Ativo' : 'Pausado'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => duplicateProduct(p.id)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                            title="Duplicar Produto"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remover produto "${p.name}"?`)) {
                                deleteProduct(p.id);
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
                  placeholder="Detalhes, notas de sabor, teor alcoólico..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
                />
              </div>

              {/* Pricing, Cost Price & Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Preço Venda (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 8.50"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs text-rose-400 font-semibold block mb-1">
                    Preço Promo (R$)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 6.99"
                    value={promoPrice}
                    onChange={(e) => setPromoPrice(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-amber-400 font-semibold block mb-1" title="Custo do produto para apuração de margem e CMV">
                    Preço Custo (R$)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 4.20"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">
                    Volume / Peso
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 350ml, 1L"
                    value={volumeOrWeight}
                    onChange={(e) => setVolumeOrWeight(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-emerald-400 font-semibold block mb-1">
                    Estoque (Unid.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ex: 48"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-emerald-300 placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* FOTO DO PRODUTO: OPÇÃO A (URL) OU OPÇÃO B (UPLOAD FIREBASE / ARQUIVO) */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    <span>Foto do Produto (URL Pública ou Upload de Arquivo)</span>
                  </span>
                  
                  {/* Mode switcher tabs */}
                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPhotoMode('url')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        photoMode === 'url' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>Link URL</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoMode('upload')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        photoMode === 'upload' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload Foto</span>
                    </button>
                  </div>
                </div>

                {photoError && (
                  <div className="p-2.5 bg-rose-950/50 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{photoError}</span>
                  </div>
                )}

                {/* Option A: Link de Imagem */}
                {photoMode === 'url' ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        placeholder="https://exemplo.com/imagem-do-produto.jpg"
                        value={imageUrl}
                        onChange={(e) => {
                          setImageUrl(e.target.value);
                          setPhotoError('');
                        }}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Cole o link direto da imagem (formato JPG, PNG ou WebP).
                    </p>
                  </div>
                ) : (
                  /* Option B: Upload de Arquivo */
                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-750 hover:border-amber-500/60 bg-slate-900/60 rounded-xl p-4 text-center cursor-pointer transition-colors"
                    >
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-2 py-2 text-amber-400">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="text-xs font-semibold">Enviando imagem ({uploadProgress}%)...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 py-1">
                          <Upload className="w-6 h-6 text-slate-400" />
                          <span className="text-xs font-bold text-slate-200">
                            Clique para selecionar foto do celular ou computador
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Formatos aceitos: JPEG, PNG, WebP • Tamanho máximo: 5MB
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Live Preview & Substitution */}
                {imageUrl && (
                  <div className="flex items-center gap-3 p-2 bg-slate-900 rounded-xl border border-slate-800 mt-2">
                    <img
                      src={imageUrl}
                      alt="Pré-visualização"
                      className="w-14 h-14 rounded-lg object-cover bg-slate-950 border border-slate-750 shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="font-semibold text-slate-200 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Foto Vinculada</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate font-mono mt-0.5">{imageUrl}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="px-2.5 py-1 text-[11px] text-rose-400 hover:bg-rose-950/40 border border-rose-800/40 rounded-lg cursor-pointer shrink-0"
                    >
                      Remover Foto
                    </button>
                  </div>
                )}
              </div>

              {/* Variations builder */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Variações de Tamanho / Pack (Opcional)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Ex: Lata 350ml, Garrafa 600ml</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nome da opção (ex: Pack 6 unidades)"
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
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>

                {variants.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {variants.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-xs"
                      >
                        <span className="text-slate-200 font-medium">{v.name}</span>
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
                    ))}
                  </div>
                )}
              </div>

              {/* Status toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span className="text-slate-300 font-medium">Produto Ativo</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span className="text-slate-300 font-medium">Em Estoque</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span className="text-slate-300 font-medium">Destaque</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={isPromo}
                    onChange={(e) => setIsPromo(e.target.checked)}
                    className="rounded text-rose-500"
                  />
                  <span className="text-rose-300 font-medium">Oferta Ativa</span>
                </label>
              </div>

              {/* Save & Cancel */}
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black rounded-xl shadow-md text-xs cursor-pointer"
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
