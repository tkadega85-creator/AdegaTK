import { Store, Category, Product, Combo, AdminUser, Order, Customer, Expense } from '../types';

export const INITIAL_STORE: Store = {
  id: 'adegatk',
  slug: 'adegatk',
  name: 'AdegaTK',
  slogan: 'Cardápio Digital & Retirada no Balcão',
  description: 'As melhores bebidas, vinhos, destilados e cervejas geladas para retirada imediata.',
  phone: '',
  whatsappNumber: '',
  instagram: '',
  address: '',
  neighborhood: '',
  city: '',
  state: '',
  zipCode: '',
  minOrderValue: 0,
  isOpenOverride: null,
  appearance: {
    theme: 'luxury-gold',
    primaryColor: '#eab308',
    accentColor: '#d97706',
    bannerUrl: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=1400&auto=format&fit=crop&q=80',
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
  { id: 'cat-cervejas', storeId: 'adegatk', name: 'Cervejas', icon: '🍺', description: 'Cervejas nacionais e importadas', order: 1, isActive: true },
  { id: 'cat-destilados', storeId: 'adegatk', name: 'Destilados', icon: '🥃', description: 'Whiskies, gins, vodkas e cachaças', order: 2, isActive: true },
  { id: 'cat-vinhos', storeId: 'adegatk', name: 'Vinhos & Espumantes', icon: '🍷', description: 'Rótulos finos e nacionais', order: 3, isActive: true },
  { id: 'cat-alcoolicas', storeId: 'adegatk', name: 'Bebidas alcoólicas', icon: '🍸', description: 'Ice, licores e aperitivos', order: 4, isActive: true },
  { id: 'cat-refrigerantes', storeId: 'adegatk', name: 'Refrigerantes & Sucos', icon: '🥤', description: 'Refrigerantes e sucos gelados', order: 5, isActive: true },
  { id: 'cat-outras', storeId: 'adegatk', name: 'Outras bebidas', icon: '🧃', description: 'Energéticos, água mineral e tônica', order: 6, isActive: true },
  { id: 'cat-gelo', storeId: 'adegatk', name: 'Gelo & Carvão', icon: '🧊', description: 'Gelo em cubos, filtrado e de sabor', order: 7, isActive: true },
  { id: 'cat-tabacaria', storeId: 'adegatk', name: 'Tabacaria & Sedas', icon: '🚬', description: 'Cigarros, sedas e acessórios', order: 8, isActive: true },
  { id: 'cat-conveniencia', storeId: 'adegatk', name: 'Conveniência & Petiscos', icon: '🍫', description: 'Salgadinhos, amendoins e chocolates', order: 9, isActive: true },
  { id: 'cat-combos', storeId: 'adegatk', name: 'Combos & Kits', icon: '🎁', description: 'Combos de destilados com energético', order: 10, isActive: true },
];

// Clean empty collections for production use (Requirement #1 & #2)
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_COMBOS: Combo[] = [];
export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_CUSTOMERS: Customer[] = [];
export const INITIAL_EXPENSES: Expense[] = [];

// Primary Administrator initialized for the store owner
export const INITIAL_USERS: AdminUser[] = [
  {
    id: 'user-primary-owner',
    name: 'Proprietário AdegaTK',
    email: 'tkadega85@gmail.com',
    role: 'admin',
    storeId: 'adegatk',
    isActive: true,
    permissions: {
      canManageCatalog: true,
      canManageOrders: true,
      canManageFinances: true,
      canManageUsers: true,
      canManageSettings: true,
    },
  },
];
