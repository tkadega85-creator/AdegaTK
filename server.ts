import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'store.json');
const UPLOADS_DIR = path.resolve(__dirname, 'public', 'uploads');

// Ensure data and uploads directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface DatabaseSchema {
  store: any;
  categories: any[];
  products: any[];
  combos: any[];
  orders: any[];
  customers: any[];
  expenses: any[];
  users: any[];
}

function hashPassword(pass: string): string {
  return crypto.createHash('sha256').update(pass + '_adegatk_salt_2026').digest('hex');
}

function getInitialDatabase(): DatabaseSchema {
  return {
    store: {
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
    },
    categories: [
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
    ],
    products: [],
    combos: [],
    orders: [],
    customers: [],
    expenses: [],
    users: [
      {
        id: 'user-primary-owner',
        name: 'Proprietário AdegaTK',
        email: 'tkadega85@gmail.com',
        role: 'admin',
        storeId: 'adegatk',
        isActive: true,
        passwordHash: hashPassword('admin123456'), // Initial setup password, customizable in panel
        permissions: {
          canManageCatalog: true,
          canManageOrders: true,
          canManageFinances: true,
          canManageUsers: true,
          canManageSettings: true,
        },
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (!Array.isArray(parsed.customers)) {
        parsed.customers = [];
      }
      if (!Array.isArray(parsed.expenses)) {
        parsed.expenses = [];
      }
      // Remove any lingering delivery zones
      if (parsed.deliveryZones) {
        delete parsed.deliveryZones;
      }
      // Ensure primary owner exists
      if (!parsed.users || !parsed.users.some((u: any) => u.email === 'tkadega85@gmail.com')) {
        const initial = getInitialDatabase();
        parsed.users = initial.users;
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading database file, initializing defaults:', err);
  }
  const initial = getInitialDatabase();
  saveDatabase(initial);
  return initial;
}

function saveDatabase(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Static uploads directory
  app.use('/uploads', express.static(UPLOADS_DIR));

  // In-memory reference synced to file
  let db = loadDatabase();

  // API Routes
  // 1. Store configuration
  app.get('/api/store', (_req: Request, res: Response) => {
    res.json({ success: true, store: db.store });
  });

  app.put('/api/store', (req: Request, res: Response) => {
    try {
      db.store = { ...db.store, ...req.body };
      saveDatabase(db);
      res.json({ success: true, store: db.store });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Categories
  app.get('/api/categories', (_req: Request, res: Response) => {
    res.json({ success: true, categories: db.categories });
  });

  app.post('/api/categories', (req: Request, res: Response) => {
    try {
      const newCategory = {
        ...req.body,
        id: req.body.id || `cat-${Date.now()}`,
        storeId: db.store.id,
      };
      db.categories.push(newCategory);
      saveDatabase(db);
      res.status(201).json({ success: true, category: newCategory });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/categories/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.categories.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Categoria não encontrada' });
    }
    db.categories[index] = { ...db.categories[index], ...req.body };
    saveDatabase(db);
    res.json({ success: true, category: db.categories[index] });
  });

  app.delete('/api/categories/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    db.categories = db.categories.filter((c) => c.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // 3. Products
  app.get('/api/products', (_req: Request, res: Response) => {
    res.json({ success: true, products: db.products });
  });

  app.post('/api/products', (req: Request, res: Response) => {
    try {
      const newProduct = {
        ...req.body,
        id: req.body.id || `prod-${Date.now()}`,
        storeId: db.store.id,
        createdAt: new Date().toISOString(),
      };
      db.products.unshift(newProduct);
      saveDatabase(db);
      res.status(201).json({ success: true, product: newProduct });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/products/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Produto não encontrado' });
    }
    db.products[index] = { ...db.products[index], ...req.body, updatedAt: new Date().toISOString() };
    saveDatabase(db);
    res.json({ success: true, product: db.products[index] });
  });

  app.delete('/api/products/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    db.products = db.products.filter((p) => p.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // 4. Combos
  app.get('/api/combos', (_req: Request, res: Response) => {
    res.json({ success: true, combos: db.combos });
  });

  app.post('/api/combos', (req: Request, res: Response) => {
    try {
      const newCombo = {
        ...req.body,
        id: req.body.id || `combo-${Date.now()}`,
        storeId: db.store.id,
      };
      db.combos.unshift(newCombo);
      saveDatabase(db);
      res.status(201).json({ success: true, combo: newCombo });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/combos/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.combos.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Combo não encontrado' });
    }
    db.combos[index] = { ...db.combos[index], ...req.body };
    saveDatabase(db);
    res.json({ success: true, combo: db.combos[index] });
  });

  app.delete('/api/combos/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    db.combos = db.combos.filter((c) => c.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // 5. Orders (Retirada no Balcão Only)
  app.get('/api/orders', (_req: Request, res: Response) => {
    res.json({ success: true, orders: db.orders });
  });

  app.post('/api/orders', (req: Request, res: Response) => {
    try {
      const lastNumber = db.orders.length > 0 ? Math.max(...db.orders.map((o: any) => o.orderNumber || 1000)) : 1000;
      const newOrder = {
        ...req.body,
        id: req.body.id || `ord-${Date.now()}`,
        orderNumber: lastNumber + 1,
        storeId: db.store.id,
        deliveryType: 'retirada',
        deliveryFee: 0,
        createdAt: new Date().toISOString(),
      };

      // Real stock decrement if product has stockQuantity
      if (Array.isArray(newOrder.items)) {
        for (const item of newOrder.items) {
          const prodIndex = db.products.findIndex((p: any) => p.id === item.productId);
          if (prodIndex > -1 && typeof db.products[prodIndex].stockQuantity === 'number') {
            db.products[prodIndex].stockQuantity = Math.max(0, db.products[prodIndex].stockQuantity - item.quantity);
            if (db.products[prodIndex].stockQuantity === 0) {
              db.products[prodIndex].inStock = false;
            }
          }
        }
      }

      // Auto-upsert customer in db.customers
      if (newOrder.customerPhone) {
        if (!Array.isArray(db.customers)) db.customers = [];
        const cleanPhone = newOrder.customerPhone.replace(/\D/g, '');
        const existingCustIndex = db.customers.findIndex(
          (c: any) => c.phone.replace(/\D/g, '') === cleanPhone
        );

        if (existingCustIndex > -1) {
          const cust = db.customers[existingCustIndex];
          cust.totalOrders = (cust.totalOrders || 0) + 1;
          cust.totalSpent = (cust.totalSpent || 0) + (newOrder.total || 0);
          cust.lastOrderAt = newOrder.createdAt;
          if (newOrder.customerName && (!cust.name || cust.name === 'Cliente')) {
            cust.name = newOrder.customerName;
          }
        } else {
          const newCustomer = {
            id: `cust-${Date.now()}`,
            storeId: db.store.id,
            name: newOrder.customerName || 'Cliente',
            phone: newOrder.customerPhone,
            email: '',
            notes: '',
            totalOrders: 1,
            totalSpent: newOrder.total || 0,
            lastOrderAt: newOrder.createdAt,
            createdAt: newOrder.createdAt,
          };
          db.customers.unshift(newCustomer);
        }
      }

      db.orders.unshift(newOrder);
      saveDatabase(db);
      res.status(201).json({ success: true, order: newOrder });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const index = db.orders.findIndex((o) => o.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Pedido não encontrado' });
    }
    db.orders[index].status = status;
    saveDatabase(db);
    res.json({ success: true, order: db.orders[index] });
  });

  app.delete('/api/orders/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    db.orders = db.orders.filter((o) => o.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // 6. Customers
  app.get('/api/customers', (_req: Request, res: Response) => {
    res.json({ success: true, customers: db.customers || [] });
  });

  app.post('/api/customers', (req: Request, res: Response) => {
    try {
      const { name, phone, email, notes } = req.body;
      if (!name || !phone) {
        return res.status(400).json({ success: false, error: 'Nome e telefone são obrigatórios' });
      }
      if (!Array.isArray(db.customers)) db.customers = [];
      const newCustomer = {
        id: req.body.id || `cust-${Date.now()}`,
        storeId: db.store.id,
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : '',
        notes: notes ? notes.trim() : '',
        totalOrders: req.body.totalOrders || 0,
        totalSpent: req.body.totalSpent || 0,
        lastOrderAt: req.body.lastOrderAt || null,
        createdAt: new Date().toISOString(),
      };
      db.customers.unshift(newCustomer);
      saveDatabase(db);
      res.status(201).json({ success: true, customer: newCustomer });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/customers/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    if (!Array.isArray(db.customers)) db.customers = [];
    const index = db.customers.findIndex((c: any) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Cliente não encontrado' });
    }
    db.customers[index] = { ...db.customers[index], ...req.body };
    saveDatabase(db);
    res.json({ success: true, customer: db.customers[index] });
  });

  app.delete('/api/customers/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    if (!Array.isArray(db.customers)) db.customers = [];
    db.customers = db.customers.filter((c: any) => c.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // 7. Expenses (Painel Financeiro & Gestão de Custos)
  app.get('/api/expenses', (_req: Request, res: Response) => {
    res.json({ success: true, expenses: db.expenses || [] });
  });

  app.post('/api/expenses', (req: Request, res: Response) => {
    try {
      const { description, category, amount, date, notes } = req.body;
      if (!description || !amount || isNaN(Number(amount))) {
        return res.status(400).json({ success: false, error: 'Descrição e valor são obrigatórios.' });
      }
      if (!Array.isArray(db.expenses)) db.expenses = [];
      const newExpense = {
        id: req.body.id || `exp-${Date.now()}`,
        storeId: db.store.id,
        description: description.trim(),
        category: category || 'Outros',
        amount: Math.abs(Number(amount)),
        date: date || new Date().toISOString().split('T')[0],
        notes: notes ? notes.trim() : '',
        createdAt: new Date().toISOString(),
      };
      db.expenses.unshift(newExpense);
      saveDatabase(db);
      res.status(201).json({ success: true, expense: newExpense });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/expenses/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    if (!Array.isArray(db.expenses)) db.expenses = [];
    const index = db.expenses.findIndex((e: any) => e.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Despesa não encontrada' });
    }
    db.expenses[index] = {
      ...db.expenses[index],
      ...req.body,
      amount: req.body.amount !== undefined ? Math.abs(Number(req.body.amount)) : db.expenses[index].amount,
    };
    saveDatabase(db);
    res.json({ success: true, expense: db.expenses[index] });
  });

  app.delete('/api/expenses/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    if (!Array.isArray(db.expenses)) db.expenses = [];
    db.expenses = db.expenses.filter((e: any) => e.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // 8. Image Upload Endpoint (File validation: max 5MB, jpeg/png/webp)
  app.post('/api/upload', (req: Request, res: Response) => {
    try {
      const { data, filename, mimeType } = req.body;
      if (!data || !mimeType) {
        return res.status(400).json({ success: false, error: 'Dados da imagem não fornecidos.' });
      }

      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedMimes.includes(mimeType.toLowerCase())) {
        return res.status(400).json({ success: false, error: 'Formato inválido. Use JPEG, PNG ou WebP.' });
      }

      // Base64 to buffer
      const base64Data = data.includes(';base64,') ? data.split(';base64,')[1] : data;
      const buffer = Buffer.from(base64Data, 'base64');

      // Max size: 5MB = 5 * 1024 * 1024 bytes
      if (buffer.length > 5 * 1024 * 1024) {
        return res.status(400).json({ success: false, error: 'O arquivo excede o limite máximo de 5MB.' });
      }

      const ext = mimeType.split('/')[1] || 'jpg';
      const safeName = `${Date.now()}_${(filename || 'product').replace(/[^a-zA-Z0-9_-]/g, '')}.${ext}`;
      const filePath = path.resolve(UPLOADS_DIR, safeName);

      fs.writeFileSync(filePath, buffer);
      const fileUrl = `/uploads/${safeName}`;

      res.status(201).json({ success: true, url: fileUrl });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 9. Authentication & Dual Admin Accounts
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'E-mail e senha são obrigatórios' });
    }

    const hashedInput = hashPassword(password);
    const user = db.users.find(
      (u: any) => u.email.toLowerCase() === email.trim().toLowerCase() && u.isActive
    );

    if (!user) {
      return res.status(401).json({ success: false, error: 'Usuário não encontrado ou inativo.' });
    }

    // Check password (also support initial unhashed setup if newly generated)
    if (user.passwordHash && user.passwordHash !== hashedInput) {
      return res.status(401).json({ success: false, error: 'Senha incorreta.' });
    }

    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser, token: `tk_session_${safeUser.id}_${Date.now()}` });
  });

  app.post('/api/auth/change-password', (req: Request, res: Response) => {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'A nova senha deve ter no mínimo 6 caracteres.' });
    }
    const user = db.users.find((u: any) => u.id === userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    }
    user.passwordHash = hashPassword(newPassword);
    saveDatabase(db);
    res.json({ success: true, message: 'Senha atualizada com sucesso' });
  });

  app.get('/api/users', (_req: Request, res: Response) => {
    const safeUsers = db.users.map(({ passwordHash: _, ...u }: any) => u);
    res.json({ success: true, users: safeUsers });
  });

  app.post('/api/users', (req: Request, res: Response) => {
    try {
      const { name, email, role, password, permissions } = req.body;
      const cleanEmail = email.trim().toLowerCase();

      // Check duplicates
      if (db.users.some((u: any) => u.email.toLowerCase() === cleanEmail)) {
        return res.status(400).json({ success: false, error: 'Já existe um operador com este e-mail.' });
      }

      const defaultPermissions = {
        canManageCatalog: role === 'admin' || role === 'gerente',
        canManageOrders: true,
        canManageFinances: role === 'admin',
        canManageUsers: role === 'admin',
        canManageSettings: role === 'admin',
      };

      const newUser = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: cleanEmail,
        role: role || 'atendente',
        storeId: db.store.id,
        isActive: true,
        permissions: permissions || defaultPermissions,
        passwordHash: hashPassword(password || 'adega_tk_2026!'),
        createdAt: new Date().toISOString(),
      };
      db.users.push(newUser);
      saveDatabase(db);
      const { passwordHash: _, ...safe } = newUser;
      res.status(201).json({ success: true, user: safe });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/users/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    }
    const updates = { ...req.body };
    if (updates.password) {
      updates.passwordHash = hashPassword(updates.password);
      delete updates.password;
    }
    db.users[index] = { ...db.users[index], ...updates };
    saveDatabase(db);
    const { passwordHash: _, ...safe } = db.users[index];
    res.json({ success: true, user: safe });
  });

  app.delete('/api/users/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const user = db.users.find((u) => u.id === id);
    if (user && user.email === 'tkadega85@gmail.com') {
      return res.status(400).json({ success: false, error: 'A conta do proprietário principal não pode ser removida.' });
    }
    if (db.users.length <= 1) {
      return res.status(400).json({ success: false, error: 'Não é possível excluir o único administrador do sistema.' });
    }
    db.users = db.users.filter((u) => u.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Reset database endpoint
  app.post('/api/store/reset-clean', (_req: Request, res: Response) => {
    db = getInitialDatabase();
    saveDatabase(db);
    res.json({ success: true, message: 'Dados redefinidos com sucesso para o estado inicial limpo.' });
  });

  // Mount Vite or static build
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AdegaTK Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
