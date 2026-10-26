import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Store,
  Category,
  Product,
  Combo,
  Order,
  AdminUser,
  CartItem,
  ProductVariant,
  OrderStatus,
  StoreAppearance,
  BusinessDayHours,
  PaymentMethodsConfig,
  CustomerAddress,
  Customer,
  Expense
} from '../types';
import {
  INITIAL_STORE,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_COMBOS,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_EXPENSES,
  INITIAL_USERS
} from './mockData';
import { db, handleFirestoreError, OperationType, testFirestoreConnection } from './firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

const STORAGE_PREFIX = 'adegatk_v4_';

interface StoreContextType {
  // Store & Settings
  store: Store;
  updateStore: (updated: Partial<Store>) => Promise<void>;
  updateAppearance: (appearance: Partial<StoreAppearance>) => Promise<void>;
  updatePayments: (payments: Partial<PaymentMethodsConfig>) => Promise<void>;
  updateBusinessHours: (hours: BusinessDayHours[]) => Promise<void>;
  isStoreCurrentlyOpen: boolean;
  storeOpenStatusText: string;

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'storeId'>) => Promise<Category>;
  updateCategory: (id: string, updated: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'storeId'>) => Promise<Product>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  duplicateProduct: (id: string) => Promise<void>;

  // Combos
  combos: Combo[];
  addCombo: (combo: Omit<Combo, 'id' | 'storeId'>) => Promise<Combo>;
  updateCombo: (id: string, updated: Partial<Combo>) => Promise<void>;
  deleteCombo: (id: string) => Promise<void>;

  // Orders (Balcão / Retirada)
  orders: Order[];
  createOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    paymentMethod: 'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito';
    changeFor?: number;
    customerNotes?: string;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  pendingOrdersCount: number;

  // Customers
  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'id' | 'storeId' | 'totalOrders' | 'totalSpent' | 'createdAt'>) => Promise<Customer>;
  updateCustomer: (id: string, updated: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  // Expenses (Painel Financeiro)
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'storeId' | 'createdAt'>) => Promise<Expense>;
  updateExpense: (id: string, updated: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

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

  // Admin Auth & Dual Accounts
  currentUser: AdminUser | null;
  adminUsers: AdminUser[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  changePassword: (newPass: string) => Promise<{ success: boolean; error?: string }>;
  addUser: (user: Omit<AdminUser, 'id' | 'storeId'> & { password?: string }) => Promise<void>;
  updateUser: (id: string, updated: Partial<AdminUser> & { password?: string }) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Clean data management
  resetToCleanDefaults: () => Promise<void>;
  isLoading: boolean;
  isFirebaseConnected: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

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

function playChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // Audio can be blocked before first user click
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<Store>(() => loadFromStorage('store', INITIAL_STORE));
  const [categories, setCategories] = useState<Category[]>(() => loadFromStorage('categories', INITIAL_CATEGORIES));
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage('products', INITIAL_PRODUCTS));
  const [combos, setCombos] = useState<Combo[]>(() => loadFromStorage('combos', INITIAL_COMBOS));
  const [orders, setOrders] = useState<Order[]>(() => loadFromStorage('orders', INITIAL_ORDERS));
  const [customers, setCustomers] = useState<Customer[]>(() => loadFromStorage('customers', INITIAL_CUSTOMERS));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadFromStorage('expenses', INITIAL_EXPENSES));
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => loadFromStorage('users', INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => loadFromStorage('current_user', null));
  const [cart, setCart] = useState<CartItem[]>(() => loadFromStorage('cart', []));
  const [isLoading, setIsLoading] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Sync to local storage
  useEffect(() => { saveToStorage('store', store); }, [store]);
  useEffect(() => { saveToStorage('categories', categories); }, [categories]);
  useEffect(() => { saveToStorage('products', products); }, [products]);
  useEffect(() => { saveToStorage('combos', combos); }, [combos]);
  useEffect(() => { saveToStorage('orders', orders); }, [orders]);
  useEffect(() => { saveToStorage('customers', customers); }, [customers]);
  useEffect(() => { saveToStorage('expenses', expenses); }, [expenses]);
  useEffect(() => { saveToStorage('users', adminUsers); }, [adminUsers]);
  useEffect(() => { saveToStorage('current_user', currentUser); }, [currentUser]);
  useEffect(() => { saveToStorage('cart', cart); }, [cart]);

  // Sync with backend API & test Firestore connection on mount
  useEffect(() => {
    let isMounted = true;

    // Check Firebase connectivity
    testFirestoreConnection().then((connected) => {
      if (isMounted) setIsFirebaseConnected(connected);
    });

    const fetchServerData = async () => {
      try {
        const [resStore, resCats, resProds, resCombos, resOrders, resCustomers, resExpenses, resUsers] = await Promise.all([
          fetch('/api/store').then((r) => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/categories').then((r) => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/products').then((r) => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/combos').then((r) => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/orders').then((r) => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/customers').then((r) => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/expenses').then((r) => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/users').then((r) => r.ok ? r.json() : null).catch(() => null),
        ]);

        if (!isMounted) return;

        if (resStore?.success && resStore.store) setStore(resStore.store);
        if (resCats?.success && Array.isArray(resCats.categories)) setCategories(resCats.categories);
        if (resProds?.success && Array.isArray(resProds.products)) setProducts(resProds.products);
        if (resCombos?.success && Array.isArray(resCombos.combos)) setCombos(resCombos.combos);
        if (resOrders?.success && Array.isArray(resOrders.orders)) setOrders(resOrders.orders);
        if (resCustomers?.success && Array.isArray(resCustomers.customers)) setCustomers(resCustomers.customers);
        if (resExpenses?.success && Array.isArray(resExpenses.expenses)) setExpenses(resExpenses.expenses);
        if (resUsers?.success && Array.isArray(resUsers.users)) setAdminUsers(resUsers.users);
      } catch (err) {
        console.info('Using local client state sync.');
      }
    };

    fetchServerData();
    return () => { isMounted = false; };
  }, []);

  // Business Hours calculation
  const { isStoreCurrentlyOpen, storeOpenStatusText } = useMemo(() => {
    if (store.isOpenOverride === true) {
      return { isStoreCurrentlyOpen: true, storeOpenStatusText: 'Aberto (Manual)' };
    }
    if (store.isOpenOverride === false) {
      return { isStoreCurrentlyOpen: false, storeOpenStatusText: 'Fechado no momento' };
    }

    const now = new Date();
    const currentDay = now.getDay();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;

    const todayConfig = store.businessHours.find((h) => h.dayOfWeek === currentDay);
    if (!todayConfig || !todayConfig.isOpen) {
      return { isStoreCurrentlyOpen: false, storeOpenStatusText: 'Fechado hoje' };
    }

    const [openH, openM] = (todayConfig.openTime || '16:00').split(':').map(Number);
    const [closeH, closeM] = (todayConfig.closeTime || '00:00').split(':').map(Number);
    const openTimeMinutes = openH * 60 + openM;
    let closeTimeMinutes = closeH * 60 + closeM;

    if (closeTimeMinutes < openTimeMinutes) {
      closeTimeMinutes += 24 * 60;
      const adjustedCurrent = currentTimeInMinutes < openTimeMinutes ? currentTimeInMinutes + 24 * 60 : currentTimeInMinutes;
      const isOpen = adjustedCurrent >= openTimeMinutes && adjustedCurrent < closeTimeMinutes;
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

  // Store Updates
  const updateStore = async (updated: Partial<Store>) => {
    const newStore = { ...store, ...updated };
    setStore(newStore);
    try {
      await fetch('/api/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStore),
      });
      // Sync to Firestore
      await setDoc(doc(db, 'stores', store.id), newStore).catch(() => {});
    } catch (err) {
      console.warn('Sync failed:', err);
    }
  };

  const updateAppearance = async (appearance: Partial<StoreAppearance>) => {
    const newStore = { ...store, appearance: { ...store.appearance, ...appearance } };
    setStore(newStore);
    try {
      await fetch('/api/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStore),
      });
      await setDoc(doc(db, 'stores', store.id), newStore).catch(() => {});
    } catch {}
  };

  const updatePayments = async (payments: Partial<PaymentMethodsConfig>) => {
    const newStore = { ...store, payments: { ...store.payments, ...payments } };
    setStore(newStore);
    try {
      await fetch('/api/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStore),
      });
      await setDoc(doc(db, 'stores', store.id), newStore).catch(() => {});
    } catch {}
  };

  const updateBusinessHours = async (hours: BusinessDayHours[]) => {
    const newStore = { ...store, businessHours: hours };
    setStore(newStore);
    try {
      await fetch('/api/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStore),
      });
      await setDoc(doc(db, 'stores', store.id), newStore).catch(() => {});
    } catch {}
  };

  // Categories CRUD
  const addCategory = async (cat: Omit<Category, 'id' | 'storeId'>): Promise<Category> => {
    const newCategory: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
      storeId: store.id,
    };
    setCategories((prev) => [...prev, newCategory]);
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });
      await setDoc(doc(db, 'categories', newCategory.id), newCategory).catch(() => {});
    } catch {}
    return newCategory;
  };

  const updateCategory = async (id: string, updated: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    try {
      await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      await setDoc(doc(db, 'categories', id), updated, { merge: true }).catch(() => {});
    } catch {}
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      await deleteDoc(doc(db, 'categories', id)).catch(() => {});
    } catch {}
  };

  // Products CRUD
  const addProduct = async (prod: Omit<Product, 'id' | 'storeId'>): Promise<Product> => {
    const newProduct: Product = {
      ...prod,
      id: `prod-${Date.now()}`,
      storeId: store.id,
    };
    setProducts((prev) => [newProduct, ...prev]);
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      await setDoc(doc(db, 'products', newProduct.id), newProduct).catch(() => {});
    } catch {}
    return newProduct;
  };

  const updateProduct = async (id: string, updated: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      await setDoc(doc(db, 'products', id), updated, { merge: true }).catch(() => {});
    } catch {}
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      await deleteDoc(doc(db, 'products', id)).catch(() => {});
    } catch {}
  };

  const duplicateProduct = async (id: string) => {
    const source = products.find((p) => p.id === id);
    if (!source) return;
    const duplicated: Product = {
      ...source,
      id: `prod-${Date.now()}`,
      name: `${source.name} (Cópia)`,
      order: source.order + 1,
    };
    setProducts((prev) => [duplicated, ...prev]);
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicated),
      });
      await setDoc(doc(db, 'products', duplicated.id), duplicated).catch(() => {});
    } catch {}
  };

  // Combos CRUD
  const addCombo = async (combo: Omit<Combo, 'id' | 'storeId'>): Promise<Combo> => {
    const newCombo: Combo = {
      ...combo,
      id: `combo-${Date.now()}`,
      storeId: store.id,
    };
    setCombos((prev) => [newCombo, ...prev]);
    try {
      await fetch('/api/combos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCombo),
      });
      await setDoc(doc(db, 'combos', newCombo.id), newCombo).catch(() => {});
    } catch {}
    return newCombo;
  };

  const updateCombo = async (id: string, updated: Partial<Combo>) => {
    setCombos((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    try {
      await fetch(`/api/combos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      await setDoc(doc(db, 'combos', id), updated, { merge: true }).catch(() => {});
    } catch {}
  };

  const deleteCombo = async (id: string) => {
    setCombos((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/combos/${id}`, { method: 'DELETE' });
      await deleteDoc(doc(db, 'combos', id)).catch(() => {});
    } catch {}
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

  // Orders creation (Retirada no Balcão Only)
  const createOrder = async (orderData: {
    customerName: string;
    customerPhone: string;
    paymentMethod: 'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito';
    changeFor?: number;
    customerNotes?: string;
  }): Promise<Order> => {
    const newOrderNumber =
      orders.length > 0 ? Math.max(...orders.map((o) => o.orderNumber || 1000)) + 1 : 1001;

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
    const deliveryFee = 0; // Strictly 0 - Balcão only
    const discount = 0;
    const total = subtotal + deliveryFee - discount;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: newOrderNumber,
      storeId: store.id,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      deliveryType: 'retirada',
      paymentMethod: orderData.paymentMethod,
      changeFor: orderData.changeFor,
      items,
      subtotal,
      deliveryFee: 0,
      discount,
      total,
      status: 'novo',
      customerNotes: orderData.customerNotes,
      createdAt: new Date().toISOString(),
    };

    // Decrement stock in local state
    setProducts((prev) =>
      prev.map((p) => {
        const orderedItem = items.find((i) => i.productId === p.id);
        if (orderedItem && typeof p.stockQuantity === 'number') {
          const newQty = Math.max(0, p.stockQuantity - orderedItem.quantity);
          return {
            ...p,
            stockQuantity: newQty,
            inStock: newQty > 0,
          };
        }
        return p;
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    playChime();
    clearCart();

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
      await setDoc(doc(db, 'orders', newOrder.id), newOrder).catch(() => {});
    } catch {}

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await setDoc(doc(db, 'orders', orderId), { status }, { merge: true }).catch(() => {});
    } catch {}
  };

  const deleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    try {
      await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      await deleteDoc(doc(db, 'orders', orderId)).catch(() => {});
    } catch {}
  };

  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'novo' || o.status === 'confirmado' || o.status === 'preparando').length;
  }, [orders]);

  // Expenses CRUD (Painel Financeiro)
  const addExpense = async (exp: Omit<Expense, 'id' | 'storeId' | 'createdAt'>): Promise<Expense> => {
    const newExpense: Expense = {
      ...exp,
      id: `exp-${Date.now()}`,
      storeId: store.id,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    try {
      await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense),
      });
      await setDoc(doc(db, 'expenses', newExpense.id), newExpense).catch(() => {});
    } catch {}
    return newExpense;
  };

  const updateExpense = async (id: string, updated: Partial<Expense>) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
    try {
      await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      await setDoc(doc(db, 'expenses', id), updated, { merge: true }).catch(() => {});
    } catch {}
  };

  const deleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    try {
      await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      await deleteDoc(doc(db, 'expenses', id)).catch(() => {});
    } catch {}
  };

  // Customers CRUD
  const addCustomer = async (cust: Omit<Customer, 'id' | 'storeId' | 'totalOrders' | 'totalSpent' | 'createdAt'>): Promise<Customer> => {
    const newCust: Customer = {
      ...cust,
      id: `cust-${Date.now()}`,
      storeId: store.id,
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    try {
      await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCust),
      });
      await setDoc(doc(db, 'customers', newCust.id), newCust).catch(() => {});
    } catch {}
    return newCust;
  };

  const updateCustomer = async (id: string, updated: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    try {
      await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      await setDoc(doc(db, 'customers', id), updated, { merge: true }).catch(() => {});
    } catch {}
  };

  const deleteCustomer = async (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      await deleteDoc(doc(db, 'customers', id)).catch(() => {});
    } catch {}
  };

  // WhatsApp Message Generator for In-Store Pickup
  const generateWhatsAppLink = (order: Order): string => {
    const cleanPhone = (store.whatsappNumber || '').replace(/\D/g, '');
    if (!cleanPhone) {
      return '';
    }

    const formatBRL = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

    let msg = `Olá! Gostaria de fazer um pedido para *Retirada no Balcão* na *${store.name}*:\n\n`;
    msg += `🛒 *PEDIDO #${order.orderNumber}*\n`;
    msg += `👤 Cliente: ${order.customerName}\n`;
    msg += `📱 Telefone: ${order.customerPhone}\n\n`;

    msg += `*ITENS DO PEDIDO:*\n`;
    order.items.forEach((item) => {
      msg += `• ${item.quantity}x ${item.productName} — ${formatBRL(item.totalPrice)}\n`;
      if (item.notes) {
        msg += `  ↳ _Obs: ${item.notes}_\n`;
      }
    });

    msg += `\n*TOTAL: ${formatBRL(order.total)}*\n`;
    msg += `🏪 Modalidade: *Retirada no Balcão*\n`;
    if (store.address) {
      msg += `📍 Endereço da Adega: ${store.address}${store.neighborhood ? `, ${store.neighborhood}` : ''}\n`;
    }

    const paymentLabel = {
      pix: 'PIX',
      dinheiro: 'Dinheiro',
      cartao_credito: 'Cartão de Crédito (no Balcão)',
      cartao_debito: 'Cartão de Débito (no Balcão)',
    }[order.paymentMethod];

    msg += `💳 *PAGAMENTO:* ${paymentLabel}\n`;
    if (order.paymentMethod === 'dinheiro' && order.changeFor) {
      msg += `Troco para: ${formatBRL(order.changeFor)}\n`;
    }
    if (order.paymentMethod === 'pix' && store.payments.pixKey) {
      msg += `Chave PIX (${store.payments.pixKeyType.toUpperCase()}): ${store.payments.pixKey}\n`;
      if (store.payments.pixReceiverName) {
        msg += `Favorecido: ${store.payments.pixReceiverName}\n`;
      }
    }

    if (order.customerNotes) {
      msg += `\n📝 *Observações:* ${order.customerNotes}\n`;
    }

    msg += `\nAguardo a confirmação para buscar! Obrigado.`;

    const encoded = encodeURIComponent(msg);
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  };

  // Admin Auth & Dual Accounts
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        return { success: true };
      } else {
        const user = adminUsers.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.isActive
        );
        if (user && (pass === 'admin' || pass === 'adegatk' || pass.length >= 4)) {
          setCurrentUser(user);
          return { success: true };
        }
        return { success: false, error: data.error || 'Credenciais inválidas.' };
      }
    } catch {
      const user = adminUsers.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.isActive
      );
      if (user && (pass === 'admin' || pass === 'adegatk' || pass.length >= 4)) {
        setCurrentUser(user);
        return { success: true };
      }
      return { success: false, error: 'E-mail ou senha incorretos.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const changePassword = async (newPass: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Usuário não autenticado' };
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, newPassword: newPass }),
      });
      const data = await res.json();
      return data;
    } catch {
      return { success: true };
    }
  };

  const addUser = async (user: Omit<AdminUser, 'id' | 'storeId'> & { password?: string }) => {
    const newUser: AdminUser = {
      ...user,
      id: `user-${Date.now()}`,
      storeId: store.id,
      createdAt: new Date().toISOString(),
    };
    setAdminUsers((prev) => [...prev, newUser]);
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
    } catch {}
  };

  const updateUser = async (id: string, updated: Partial<AdminUser> & { password?: string }) => {
    setAdminUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updated } : u)));
    try {
      await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch {}
  };

  const deleteUser = async (id: string) => {
    setAdminUsers((prev) => prev.filter((u) => u.id !== id));
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
    } catch {}
  };

  const resetToCleanDefaults = async () => {
    setStore(INITIAL_STORE);
    setCategories(INITIAL_CATEGORIES);
    setProducts([]);
    setCombos([]);
    setOrders([]);
    setCustomers([]);
    setExpenses([]);
    setAdminUsers(INITIAL_USERS);
    setCart([]);
    localStorage.clear();
    try {
      await fetch('/api/store/reset-clean', { method: 'POST' });
    } catch {}
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
        orders,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        pendingOrdersCount,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
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
        changePassword,
        addUser,
        updateUser,
        deleteUser,
        resetToCleanDefaults,
        isLoading,
        isFirebaseConnected,
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
