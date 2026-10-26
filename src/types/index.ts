export type Role = 'admin' | 'gerente' | 'atendente';

export interface UserPermissions {
  canManageCatalog: boolean;
  canManageOrders: boolean;
  canManageFinances: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  storeId: string;
  isActive: boolean;
  avatarUrl?: string;
  passwordHash?: string;
  permissions?: UserPermissions;
  createdAt?: string;
}

export interface StoreAppearance {
  theme: 'dark-amber' | 'luxury-gold' | 'neon-night' | 'emerald-craft' | 'classic-slate';
  primaryColor: string;
  accentColor: string;
  bannerUrl: string;
  logoUrl: string;
}

export interface BusinessDayHours {
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  dayName: string;
  isOpen: boolean;
  openTime: string; // e.g. "18:00"
  closeTime: string; // e.g. "03:00"
}

export interface PaymentMethodsConfig {
  pix: boolean;
  cash: boolean;
  creditCard: boolean;
  debitCard: boolean;
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  pixReceiverName: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Lata 350ml", "Garrafa 600ml", "Dose 50ml"
  price: number;
  promoPrice?: number;
}

export interface Product {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  promoPrice?: number | null;
  costPrice?: number | null; // Custo do produto para cálculo de CMV e margem
  imageUrl: string;
  inStock: boolean;
  stockQuantity?: number;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isPromo: boolean;
  order: number;
  volumeOrWeight?: string; // e.g. "1L", "350ml", "400g"
  variants?: ProductVariant[];
}

export interface Category {
  id: string;
  storeId: string;
  name: string;
  icon: string; // emoji or icon code
  description: string;
  order: number;
  isActive: boolean;
  imageUrl?: string;
}

export interface Combo {
  id: string;
  storeId: string;
  name: string;
  description: string;
  includedItems: string[];
  originalPrice: number;
  promoPrice: number;
  imageUrl: string;
  isActive: boolean;
  isFeatured?: boolean;
}

export interface CartItem {
  id: string; // unique cart item id (e.g. productId + variantId)
  product: Product;
  selectedVariant?: ProductVariant;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export type OrderStatus = 'novo' | 'confirmado' | 'preparando' | 'pronto_retirada' | 'finalizado' | 'cancelado';

export interface OrderItem {
  productId: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface CustomerAddress {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  reference?: string;
  city?: string;
}

export interface Customer {
  id: string;
  storeId: string;
  name: string;
  phone: string;
  email?: string;
  address?: CustomerAddress;
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  storeId: string;
  customerName: string;
  customerPhone: string;
  deliveryType: 'retirada' | 'balcao';
  address?: CustomerAddress;
  paymentMethod: 'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito';
  changeFor?: number;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number; // Always 0 for in-store pickup
  discount: number;
  total: number;
  status: OrderStatus;
  customerNotes?: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'Fornecedores'
  | 'Aluguel'
  | 'Energia/Água'
  | 'Funcionários'
  | 'Embalagens'
  | 'Manutenção'
  | 'Outros';

export interface Expense {
  id: string;
  storeId: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
}

export interface Store {
  id: string;
  slug: string;
  name: string;
  slogan: string;
  description: string;
  phone: string;
  whatsappNumber: string;
  instagram: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  minOrderValue: number;
  isOpenOverride: boolean | null; // null = use business hours
  appearance: StoreAppearance;
  businessHours: BusinessDayHours[];
  payments: PaymentMethodsConfig;
}
