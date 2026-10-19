import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  store: any;
  categories: any[];
  products: any[];
  combos: any[];
  deliveryZones: any[];
  orders: any[];
  users: any[];
}

function hashPassword(pass: string): string {
  return crypto.createHash('sha256').update(pass + '_adegatk_salt').digest('hex');
}

function getInitialDatabase(): DatabaseSchema {
  return {
    store: {
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
    },
    categories: [
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
    ],
    products: [],
    combos: [],
    deliveryZones: [],
    orders: [],
    users: [
      {
        id: 'user-primary-admin',
        name: 'Administrador AdegaTK',
        email: 'tkadega85@gmail.com',
        role: 'admin',
        storeId: 'adegatk',
        isActive: true,
        passwordHash: hashPassword('admin'), // initial password, changeable in panel
      },
    ],
  };
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
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

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

  // 5. Delivery Zones
  app.get('/api/delivery-zones', (_req: Request, res: Response) => {
    res.json({ success: true, deliveryZones: db.deliveryZones });
  });

  app.post('/api/delivery-zones', (req: Request, res: Response) => {
    try {
      const newZone = {
        ...req.body,
        id: req.body.id || `zone-${Date.now()}`,
        storeId: db.store.id,
      };
      db.deliveryZones.push(newZone);
      saveDatabase(db);
      res.status(201).json({ success: true, zone: newZone });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/delivery-zones/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.deliveryZones.findIndex((z) => z.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Região não encontrada' });
    }
    db.deliveryZones[index] = { ...db.deliveryZones[index], ...req.body };
    saveDatabase(db);
    res.json({ success: true, zone: db.deliveryZones[index] });
  });

  app.delete('/api/delivery-zones/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    db.deliveryZones = db.deliveryZones.filter((z) => z.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // 6. Orders
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

  // 7. Authentication & Users
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

    // Check password
    if (user.passwordHash && user.passwordHash !== hashedInput) {
      return res.status(401).json({ success: false, error: 'Senha incorreta.' });
    }

    // Successful login - return safe user profile without hash
    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser, token: `token_${safeUser.id}_${Date.now()}` });
  });

  app.post('/api/auth/change-password', (req: Request, res: Response) => {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword || newPassword.length < 4) {
      return res.status(400).json({ success: false, error: 'Senha inválida (mínimo 4 caracteres)' });
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
      const { name, email, role, password } = req.body;
      const newUser = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role || 'atendente',
        storeId: db.store.id,
        isActive: true,
        passwordHash: hashPassword(password || 'adega123'),
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
    if (db.users.length <= 1) {
      return res.status(400).json({ success: false, error: 'Não é possível excluir o único administrador do sistema.' });
    }
    db.users = db.users.filter((u) => u.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Reset database endpoint (for clean resets if requested)
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
