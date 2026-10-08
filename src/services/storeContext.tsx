import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Store,
  Category,
  Product,
  Combo,
  DeliveryZone,
  Order,
  AdminUser,
  CartItem,
  ProductVariant,
  OrderStatus,
  StoreAppearance,
  BusinessDayHours,
  PaymentMethodsConfig,
  CustomerAddress
} from '../types';
import {
  INITIAL_STORE,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_COMBOS,
  INITIAL_DELIVERY_ZONES,
  INITIAL_ORDERS,
  INITIAL_USERS
} from './mockData';

// Local storage key prefix
const STORAGE_PREFIX = 'adegatk_v2_';

interface StoreContextType {
  // Store & Settings
  store: Store;
  updateStore: (updated: Partial<Store>) => void;
  updateAppearance: (appearance: Partial<StoreAppearance>) => void;
  updatePayments: (payments: Partial<PaymentMethodsConfig>) => void;
  updateBusinessHours: (hours: BusinessDayHours[]) => void;
  isStoreCurrentlyOpen: boolean;
  storeOpenStatusText: string;

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'storeId'>) => void;
  updateCategory: (id: string, updated: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'storeId'>) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;

  // Combos
  combos: Combo[];
  addCombo: (combo: Omit<Combo, 'id' | 'storeId'>) => void;
  updateCombo: (id: string, updated: Partial<Combo>) => void;
  deleteCombo: (id: string) => void;

  // Delivery Zones
  deliveryZones: DeliveryZone[];
  addDeliveryZone: (zone: Omit<DeliveryZone, 'id' | 'storeId'>) => void;
  updateDeliveryZone: (id: string, updated: Partial<DeliveryZone>) => void;
  deleteDeliveryZone: (id: string) => void;

  // Orders
  orders: Order[];
  createOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    deliveryType: 'delivery' | 'retirada';
    address?: CustomerAddress;
    paymentMethod: 'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito';
    changeFor?: number;
    customerNotes?: string;
    deliveryFee: number;
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;
  pendingOrdersCount: number;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number, notes?: string) => void;
  updateCartItemQuantity: (cartItemId: string, newQty: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTotalCount: number;

  // WhatsApp
  generateWhatsAppLink: (order: Order) => string;

  // Admin Auth & Users
  currentUser: AdminUser | null;
  adminUsers: AdminUser[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<AdminUser, 'id' | 'storeId'>) => void;
  updateUser: (id: string, updated: Partial<AdminUser>) => void;
  deleteUser: (id: string) => void;

  // Reset to default
  resetToDefaults: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Helper to load / save local storage safely
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// Simple audio tone chime using Web Audio API for new order alert
function playChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // Audio might be blocked if user hasn't interacted yet
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<Store>(() => loadFromStorage('store', INITIAL_STORE));
  const [categories, setCategories] = useState<Category[]>(() => loadFromStorage('categories', INITIAL_CATEGORIES));
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage('products', INITIAL_PRODUCTS));
  const [combos, setCombos] = useState<Combo[]>(() => loadFromStorage('combos', INITIAL_COMBOS));
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(() => loadFromStorage('delivery_zones', INITIAL_DELIVERY_ZONES));
  const [orders, setOrders] = useState<Order[]>(() => loadFromStorage('orders', INITIAL_ORDERS));
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => loadFromStorage('users', INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => loadFromStorage('current_user', null));
  const [cart, setCart] = useState<CartItem[]>(() => loadFromStorage('cart', []));

  // Sync state to storage
  useEffect(() => { saveToStorage('store', store); }, [store]);
  useEffect(() => { saveToStorage('categories', categories); }, [categories]);
  useEffect(() => { saveToStorage('products', products); }, [products]);
  useEffect(() => { saveToStorage('combos', combos); }, [combos]);
  useEffect(() => { saveToStorage('delivery_zones', deliveryZones); }, [deliveryZones]);
  useEffect(() => { saveToStorage('orders', orders); }, [orders]);
  useEffect(() => { saveToStorage('users', adminUsers); }, [adminUsers]);
  useEffect(() => { saveToStorage('current_user', currentUser); }, [currentUser]);
  useEffect(() => { saveToStorage('cart', cart); }, [cart]);

  // Business Hours check logic
  const { isStoreCurrentlyOpen, storeOpenStatusText } = useMemo(() => {
    if (store.isOpenOverride === true) {
      return { isStoreCurrentlyOpen: true, storeOpenStatusText: 'Aberto (Manual)' };
    }
    if (store.isOpenOverride === false) {
      return { isStoreCurrentlyOpen: false, storeOpenStatusText: 'Fechado no momento' };
    }

    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sunday
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;

    const todayConfig = store.businessHours.find((h) => h.dayOfWeek === currentDay);
    if (!todayConfig || !todayConfig.isOpen) {
      return { isStoreCurrentlyOpen: false, storeOpenStatusText: 'Fechado hoje' };
    }

    const [openH, openM] = todayConfig.openTime.split(':').map(Number);
    const [closeH, closeM] = todayConfig.closeTime.split(':').map(Number);
    const openTimeMinutes = openH * 60 + openM;
    let closeTimeMinutes = closeH * 60 + closeM;

    // Overnight hours (e.g., 18:00 to 04:00)
    if (closeTimeMinutes < openTimeMinutes) {
      closeTimeMinutes += 24 * 60; // next day
      const adjustedCurrentMinutes = currentTimeInMinutes < openTimeMinutes ? currentTimeInMinutes + 24 * 60 : currentTimeInMinutes;
      const isOpen = adjustedCurrentMinutes >= openTimeMinutes && adjustedCurrentMinutes < closeTimeMinutes;
      return {
        isStoreCurrentlyOpen: isOpen,
        storeOpenStatusText: isOpen ? `Aberto até ${todayConfig.closeTime}` : `Abre às ${todayConfig.openTime}`,
      };
    } else {
      const isOpen = currentTimeInMinutes >= openTimeMinutes && currentTimeInMinutes < closeTimeMinutes;
      return {
        isStoreCurrentlyOpen: isOpen,
        storeOpenStatusText: isOpen ? `Aberto até ${todayConfig.closeTime}` : `Abre às ${todayConfig.openTime}`,
      };
    }
  }, [store.businessHours, store.isOpenOverride]);

  // Update store info
  const updateStore = (updated: Partial<Store>) => {
    setStore((prev) => ({ ...prev, ...updated }));
  };

  const updateAppearance = (appearance: Partial<StoreAppearance>) => {
    setStore((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, ...appearance },
    }));
  };

  const updatePayments = (payments: Partial<PaymentMethodsConfig>) => {
    setStore((prev) => ({
      ...prev,
      payments: { ...prev.payments, ...payments },
    }));
  };

  const updateBusinessHours = (hours: BusinessDayHours[]) => {
    setStore((prev) => ({
      ...prev,
      businessHours: hours,
    }));
  };

  // Categories CRUD
  const addCategory = (cat: Omit<Category, 'id' | 'storeId'>) => {
    const newCategory: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
      storeId: store.id,
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updated: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Products CRUD
  const addProduct = (prod: Omit<Product, 'id' | 'storeId'>) => {
    const newProduct: Product = {
      ...prod,
      id: `prod-${Date.now()}`,
      storeId: store.id,
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const duplicateProduct = (id: string) => {
    const source = products.find((p) => p.id === id);
    if (!source) return;
    const duplicated: Product = {
      ...source,
      id: `prod-${Date.now()}`,
      name: `${source.name} (Cópia)`,
      order: source.order + 1,
    };
    setProducts((prev) => [duplicated, ...prev]);
  };

  // Combos CRUD
  const addCombo = (combo: Omit<Combo, 'id' | 'storeId'>) => {
    const newCombo: Combo = {
      ...combo,
      id: `combo-${Date.now()}`,
      storeId: store.id,
    };
    setCombos((prev) => [newCombo, ...prev]);
  };

  const updateCombo = (id: string, updated: Partial<Combo>) => {
    setCombos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
  };

  const deleteCombo = (id: string) => {
    setCombos((prev) => prev.filter((c) => c.id !== id));
  };

  // Delivery Zones CRUD
  const addDeliveryZone = (zone: Omit<DeliveryZone, 'id' | 'storeId'>) => {
    const newZone: DeliveryZone = {
      ...zone,
      id: `zone-${Date.now()}`,
      storeId: store.id,
    };
    setDeliveryZones((prev) => [...prev, newZone]);
  };

  const updateDeliveryZone = (id: string, updated: Partial<DeliveryZone>) => {
    setDeliveryZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, ...updated } : z))
    );
  };

  const deleteDeliveryZone = (id: string) => {
    setDeliveryZones((prev) => prev.filter((z) => z.id !== id));
  };

  // Cart operations
  const addToCart = (
    product: Product,
    variant?: ProductVariant,
    quantity: number = 1,
    notes?: string
  ) => {
    const effectivePrice = variant
      ? variant.promoPrice ?? variant.price
      : product.promoPrice ?? product.price;

    const cartItemId = variant ? `${product.id}-${variant.id}` : product.id;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        updated[existingIndex] = {
          ...existing,
          quantity: existing.quantity + quantity,
          notes: notes !== undefined ? notes : existing.notes,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          product,
          selectedVariant: variant,
          quantity,
          unitPrice: effectivePrice,
          notes,
        };
        return [...prev, newItem];
      }
    });
  };

  const updateCartItemQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQty } : item))
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  }, [cart]);

  const cartTotalCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // Orders creation and management
  const createOrder = (orderData: {
    customerName: string;
    customerPhone: string;
    deliveryType: 'delivery' | 'retirada';
    address?: CustomerAddress;
    paymentMethod: 'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito';
    changeFor?: number;
    customerNotes?: string;
    deliveryFee: number;
  }): Order => {
    const newOrderNumber =
      orders.length > 0 ? Math.max(...orders.map((o) => o.orderNumber)) + 1 : 1001;

    const items = cart.map((item) => ({
      productId: item.product.id,
      productName: item.selectedVariant
        ? `${item.product.name} (${item.selectedVariant.name})`
        : item.product.name,
      variantName: item.selectedVariant?.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * item.quantity,
      notes: item.notes,
    }));

    const subtotal = cartSubtotal;
    const deliveryFee = orderData.deliveryType === 'delivery' ? orderData.deliveryFee : 0;
    const discount = 0;
    const total = subtotal + deliveryFee - discount;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: newOrderNumber,
      storeId: store.id,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      deliveryType: orderData.deliveryType,
      address: orderData.address,
      paymentMethod: orderData.paymentMethod,
      changeFor: orderData.changeFor,
      items,
      subtotal,
      deliveryFee,
      discount,
      total,
      status: 'novo',
      customerNotes: orderData.customerNotes,
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    playChime();
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'novo' || o.status === 'confirmado' || o.status === 'preparando').length;
  }, [orders]);

  // WhatsApp Message Generator (requirement #8)
  const generateWhatsAppLink = (order: Order): string => {
    const formatBRL = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

    let msg = `Olá! Gostaria de fazer um pedido na *${store.name}*:\n\n`;
    msg += `🛒 *PEDIDO #${order.orderNumber}*\n`;
    msg += `👤 Cliente: ${order.customerName}\n`;
    msg += `📱 Telefone: ${order.customerPhone}\n\n`;

    msg += `*ITENS:*\n`;
    order.items.forEach((item) => {
      msg += `• ${item.quantity}x ${item.productName} — ${formatBRL(item.totalPrice)}\n`;
      if (item.notes) {
        msg += `  ↳ _Obs: ${item.notes}_\n`;
      }
    });

    msg += `\nSubtotal: ${formatBRL(order.subtotal)}\n`;
    if (order.deliveryType === 'delivery') {
      msg += `Taxa de Entrega: ${order.deliveryFee === 0 ? 'GRÁTIS' : formatBRL(order.deliveryFee)}\n`;
    } else {
      msg += `Forma: *Retirada no Balcão*\n`;
    }
    msg += `*TOTAL: ${formatBRL(order.total)}*\n\n`;

    if (order.deliveryType === 'delivery' && order.address) {
      msg += `📍 *ENTREGA:*\n`;
      msg += `${order.address.street}, Nº ${order.address.number}\n`;
      if (order.address.complement) msg += `Compl: ${order.address.complement}\n`;
      msg += `Bairro: ${order.address.neighborhood}\n`;
      if (order.address.reference) msg += `Ref: ${order.address.reference}\n`;
      msg += `\n`;
    } else {
      msg += `🏬 *RETIRADA:*\nRetirar no balcão da loja\n\n`;
    }

    const paymentLabel = {
      pix: 'PIX',
      dinheiro: 'Dinheiro',
      cartao_credito: 'Cartão de Crédito',
      cartao_debito: 'Cartão de Débito',
    }[order.paymentMethod];

    msg += `💳 *PAGAMENTO:* ${paymentLabel}\n`;
    if (order.paymentMethod === 'dinheiro' && order.changeFor) {
      msg += `Troco para: ${formatBRL(order.changeFor)}\n`;
    }
    if (order.paymentMethod === 'pix' && store.payments.pixKey) {
      msg += `Chave PIX (${store.payments.pixKeyType.toUpperCase()}): ${store.payments.pixKey}\n`;
      msg += `Favorecido: ${store.payments.pixReceiverName}\n`;
    }

    if (order.customerNotes) {
      msg += `\n📝 *Observações:* ${order.customerNotes}\n`;
    }

    msg += `\nObrigado! Aguardo a confirmação.`;

    const cleanPhone = store.whatsappNumber.replace(/\D/g, '');
    const encoded = encodeURIComponent(msg);
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  };

  // Admin Auth
  const login = (email: string, pass: string): boolean => {
    // In our prototype, password 'admin' or matching user email succeeds
    const user = adminUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.isActive
    );
    if (user && (pass === 'admin' || pass === '123456' || pass === 'adegatk')) {
      setCurrentUser(user);
      return true;
    }
    // Default fallback to tkadega85@gmail.com
    if (email.trim().toLowerCase() === 'tkadega85@gmail.com' && (pass === 'admin' || pass === 'adegatk' || pass === '123456')) {
      const admin = adminUsers[0];
      setCurrentUser(admin);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addUser = (user: Omit<AdminUser, 'id' | 'storeId'>) => {
    const newUser: AdminUser = {
      ...user,
      id: `user-${Date.now()}`,
      storeId: store.id,
    };
    setAdminUsers((prev) => [...prev, newUser]);
  };

  const updateUser = (id: string, updated: Partial<AdminUser>) => {
    setAdminUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updated } : u))
    );
  };

  const deleteUser = (id: string) => {
    setAdminUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const resetToDefaults = () => {
    setStore(INITIAL_STORE);
    setCategories(INITIAL_CATEGORIES);
    setProducts(INITIAL_PRODUCTS);
    setCombos(INITIAL_COMBOS);
    setDeliveryZones(INITIAL_DELIVERY_ZONES);
    setOrders(INITIAL_ORDERS);
    setAdminUsers(INITIAL_USERS);
    setCart([]);
    localStorage.clear();
  };

  return (
    <StoreContext.Provider
      value={{
        store,
        updateStore,
        updateAppearance,
        updatePayments,
        updateBusinessHours,
        isStoreCurrentlyOpen,
        storeOpenStatusText,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        combos,
        addCombo,
        updateCombo,
        deleteCombo,
        deliveryZones,
        addDeliveryZone,
        updateDeliveryZone,
        deleteDeliveryZone,
        orders,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        pendingOrdersCount,
        cart,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartTotalCount,
        generateWhatsAppLink,
        currentUser,
        adminUsers,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
        resetToDefaults,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
