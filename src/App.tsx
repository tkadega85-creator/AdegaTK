import React, { useState, useMemo } from 'react';
import { StoreProvider, useStore } from './services/storeContext';
import { Header } from './components/public/Header';
import { HeroBanner } from './components/public/HeroBanner';
import { CategoryBar } from './components/public/CategoryBar';
import { ProductCard } from './components/public/ProductCard';
import { ProductModal } from './components/public/ProductModal';
import { CombosSection } from './components/public/CombosSection';
import { PromoSection } from './components/public/PromoSection';
import { CartDrawer } from './components/public/CartDrawer';
import { CheckoutModal } from './components/public/CheckoutModal';
import { OrderSuccessModal } from './components/public/OrderSuccessModal';
import { StoreFooter } from './components/public/StoreFooter';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { Product, Order } from './types';
import {
  ShoppingBag,
  Search,
  MessageCircle,
  Home,
  SlidersHorizontal,
  Flame,
  Star,
  Sparkles
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    products,
    categories,
    store,
    cartTotalCount,
    cartSubtotal,
    currentUser,
  } = useStore();

  // Navigation State
  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Public Catalog State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectingProduct, setInspectingProduct] = useState<Product | null>(null);

  // Cart & Checkout State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Filtered products calculation
  const displayedProducts = useMemo(() => {
    return products.filter((p) => {
      // Must be active for public menu
      if (!p.isActive) return false;

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const cat = categories.find((c) => c.id === p.categoryId);
        const matchesCatName = cat ? cat.name.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesDesc && !matchesCatName) return false;
      }

      // Category tab match
      if (selectedCategoryId === 'all') return true;
      if (selectedCategoryId === 'promo') return p.isPromo && p.promoPrice && p.promoPrice < p.price;
      if (selectedCategoryId === 'bestsellers') return p.isBestSeller;

      return p.categoryId === selectedCategoryId;
    });
  }, [products, categories, selectedCategoryId, searchQuery]);

  const handleOpenAdminLogin = () => {
    if (currentUser) {
      setViewMode('admin');
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoginOpen(false);
    setViewMode('admin');
  };

  const scrollToMenu = () => {
    const el = document.getElementById('catalogo-produtos');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If in admin mode, show Admin layout
  if (viewMode === 'admin') {
    if (!currentUser) {
      // Not logged in, redirect to public & open login
      setViewMode('public');
      setIsAdminLoginOpen(true);
      return null;
    }
    return <AdminLayout onBackToStore={() => setViewMode('public')} />;
  }

  const cleanPhone = store.whatsappNumber.replace(/\D/g, '');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black pb-16 md:pb-0">
      {/* Public Header */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdminLogin={handleOpenAdminLogin}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
      />

      {/* Hero Banner with search & slogan */}
      <HeroBanner
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onScrollToMenu={scrollToMenu}
      />

      {/* Horizontal Category Navigation Bar */}
      <CategoryBar
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      {/* Featured Combos Section (shows on 'all' or when combos category is active) */}
      {!searchQuery && (selectedCategoryId === 'all' || selectedCategoryId === 'cat-combos') && (
        <CombosSection onOpenDetails={(p) => setInspectingProduct(p)} />
      )}

      {/* Promo Special Offers Section */}
      {!searchQuery && selectedCategoryId === 'all' && (
        <PromoSection onOpenDetails={(p) => setInspectingProduct(p)} />
      )}

      {/* Main Catalog Products Section */}
      <main id="catalogo-produtos" className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Section title & active category descriptor */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-2 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              {searchQuery ? 'Resultado da Busca' : 'Cardápio Digital'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {searchQuery
                ? `Buscando por: "${searchQuery}"`
                : selectedCategoryId === 'all'
                ? 'Todas as Bebidas e Itens'
                : selectedCategoryId === 'promo'
                ? 'Ofertas & Promoções 🔥'
                : selectedCategoryId === 'bestsellers'
                ? 'Mais Vendidos ⭐'
                : categories.find((c) => c.id === selectedCategoryId)?.name || 'Produtos'}
            </h2>
          </div>
          <span className="text-xs text-slate-400 mt-1 sm:mt-0 font-medium">
            {displayedProducts.length} {displayedProducts.length === 1 ? 'item disponível' : 'itens disponíveis'}
          </span>
        </div>

        {/* Products Grid */}
        {displayedProducts.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl space-y-4 max-w-md mx-auto my-8">
            <div className="text-4xl">🔍</div>
            <h3 className="text-lg font-bold text-white">Nenhum produto encontrado</h3>
            <p className="text-xs text-slate-400">
              {searchQuery
                ? `Não encontramos nenhum item com o termo "${searchQuery}". Tente pesquisar por outra bebida.`
                : 'Esta categoria não possui produtos cadastrados no momento.'}
            </p>
            {(searchQuery || selectedCategoryId !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategoryId('all');
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Ver Todas as Bebidas
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={(p) => setInspectingProduct(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <StoreFooter onOpenAdminLogin={handleOpenAdminLogin} />

      {/* Mobile Floating Bottom Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 px-4 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => {
            setSelectedCategoryId('all');
            setSearchQuery('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white transition-colors"
        >
          <Home className="w-5 h-5 text-amber-500" />
          <span>Cardápio</span>
        </button>

        <button
          onClick={() => {
            setSelectedCategoryId('promo');
            scrollToMenu();
          }}
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white transition-colors"
        >
          <Flame className="w-5 h-5 text-rose-500" />
          <span>Promoções</span>
        </button>

        <a
          href={`https://wa.me/${cleanPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white transition-colors"
        >
          <MessageCircle className="w-5 h-5 text-emerald-400" />
          <span>WhatsApp</span>
        </a>

        {/* Big Cart button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>R$ {cartSubtotal.toFixed(0)}</span>
          {cartTotalCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
              {cartTotalCount}
            </span>
          )}
        </button>
      </div>

      {/* Modals & Overlays */}
      <ProductModal
        product={inspectingProduct}
        onClose={() => setInspectingProduct(null)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(order) => {
          setIsCheckoutOpen(false);
          setLastPlacedOrder(order);
        }}
      />

      <OrderSuccessModal
        order={lastPlacedOrder}
        onClose={() => setLastPlacedOrder(null)}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
}
