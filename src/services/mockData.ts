import { Store, Category, Product, Combo, DeliveryZone, AdminUser, Order } from '../types';

export const INITIAL_STORE: Store = {
  id: 'adegatk',
  slug: 'adegatk',
  name: 'AdegaTK',
  slogan: 'Cardápio Digital & Delivery',
  description: '',
  phone: '',
  whatsappNumber: '',
  instagram: '',
  address: '',
  neighborhood: '',
  city: '',
  state: '',
  zipCode: '',
  minOrderValue: 0,
  freeDeliveryOver: 0,
  defaultDeliveryFee: 0,
  estimatedDeliveryTime: '30 - 50 min',
  isOpenOverride: null,
  appearance: {
    theme: 'dark-amber',
    primaryColor: '#f59e0b',
    accentColor: '#d97706',
    bannerUrl: '',
    logoUrl: '',
  },
  businessHours: [
    { dayOfWeek: 0, dayName: 'Domingo', isOpen: true, openTime: '14:00', closeTime: '00:00' },
    { dayOfWeek: 1, dayName: 'Segunda-feira', isOpen: true, openTime: '16:00', closeTime: '00:00' },
    { dayOfWeek: 2, dayName: 'Terça-feira', isOpen: true, openTime: '16:00', closeTime: '00:00' },
    { dayOfWeek: 3, dayName: 'Quarta-feira', isOpen: true, openTime: '16:00', closeTime: '00:00' },
    { dayOfWeek: 4, dayName: 'Quinta-feira', isOpen: true, openTime: '16:00', closeTime: '01:00' },
    { dayOfWeek: 5, dayName: 'Sexta-feira', isOpen: true, openTime: '14:00', closeTime: '03:00' },
    { dayOfWeek: 6, dayName: 'Sábado', isOpen: true, openTime: '12:00', closeTime: '03:00' },
  ],
  payments: {
    pix: true,
    cash: true,
    creditCard: true,
    debitCard: true,
    pixKey: '',
    pixKeyType: 'email',
    pixReceiverName: '',
  },
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-cervejas', storeId: 'adegatk', name: 'Cervejas', icon: '🍺', description: '', order: 1, isActive: true },
  { id: 'cat-destilados', storeId: 'adegatk', name: 'Destilados', icon: '🥃', description: '', order: 2, isActive: true },
  { id: 'cat-vinhos', storeId: 'adegatk', name: 'Vinhos', icon: '🍷', description: '', order: 3, isActive: true },
  { id: 'cat-alcoolicas', storeId: 'adegatk', name: 'Bebidas alcoólicas', icon: '🍸', description: '', order: 4, isActive: true },
  { id: 'cat-refrigerantes', storeId: 'adegatk', name: 'Refrigerantes', icon: '🥤', description: '', order: 5, isActive: true },
  { id: 'cat-outras', storeId: 'adegatk', name: 'Outras bebidas', icon: '🧃', description: '', order: 6, isActive: true },
  { id: 'cat-gelo', storeId: 'adegatk', name: 'Gelo', icon: '🧊', description: '', order: 7, isActive: true },
  { id: 'cat-tabacaria', storeId: 'adegatk', name: 'Tabacaria', icon: '🚬', description: '', order: 8, isActive: true },
  { id: 'cat-conveniencia', storeId: 'adegatk', name: 'Conveniência', icon: '🍫', description: '', order: 9, isActive: true },
  { id: 'cat-combos', storeId: 'adegatk', name: 'Combos', icon: '🎁', description: '', order: 10, isActive: true },
];

// Clean empty collections for production use (Requirement #2)
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_COMBOS: Combo[] = [];
export const INITIAL_DELIVERY_ZONES: DeliveryZone[] = [];
export const INITIAL_ORDERS: Order[] = [];

// Primary Administrator initialized for the store owner
export const INITIAL_USERS: AdminUser[] = [
  {
    id: 'user-primary-admin',
    name: 'Administrador AdegaTK',
    email: 'tkadega85@gmail.com',
    role: 'admin',
    storeId: 'adegatk',
    isActive: true,
  },
];
