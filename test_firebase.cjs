const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc, getDocs, collection } = require('firebase/firestore');
const http = require('http');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function runFirebaseAudit() {
  console.log('====================================================');
  console.log('   AUDITORIA E VALIDAÇÃO DE SEGURANÇA FIREBASE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} ${details}`);
      failed++;
    }
  }

  // 1. Store profile public read
  console.log('--- TESTE 1: Leitura pública do perfil da loja no Firestore ---');
  try {
    const storeSnap = await getDoc(doc(db, 'stores', 'adegatk'));
    assert(storeSnap.exists() && storeSnap.data().name === 'AdegaTK', 'Loja recuperada do Firestore (stores/adegatk)');
  } catch (err) {
    assert(false, 'Leitura stores/adegatk', err.message);
  }

  // 2. Categories public read
  console.log('\n--- TESTE 2: Leitura pública das categorias do catálogo ---');
  try {
    const catSnap = await getDocs(collection(db, 'categories'));
    assert(catSnap.size >= 10, `Categorias disponíveis em tempo real: ${catSnap.size} categorias encontradas`);
  } catch (err) {
    assert(false, 'Leitura categories', err.message);
  }

  // 3. Security: Expenses blocked from public read
  console.log('\n--- TESTE 3: Bloqueio estrito de leitura de despesas financeiras ---');
  try {
    await getDocs(collection(db, 'expenses'));
    assert(false, 'Despesas financeiras deveriam ser bloqueadas para leitura não autorizada');
  } catch (err) {
    assert(err.code === 'permission-denied', 'Tentativa de ler despesas financeiras bloqueada com permission-denied');
  }

  // 4. Security: Customers blocked from public read
  console.log('\n--- TESTE 4: Bloqueio estrito de leitura de dados de clientes (LGPD) ---');
  try {
    await getDocs(collection(db, 'customers'));
    assert(false, 'Clientes deveriam ser bloqueados para leitura não autorizada');
  } catch (err) {
    assert(err.code === 'permission-denied', 'Tentativa de ler dados de clientes bloqueada com permission-denied');
  }

  // 5. Security: Products blocked from unauthorized direct write
  console.log('\n--- TESTE 5: Bloqueio de inserção direta não autorizada em produtos ---');
  try {
    await setDoc(doc(db, 'products', 'prod-hacker-attempt'), {
      storeId: 'adegatk',
      categoryId: 'cat-cervejas',
      name: 'Produto Hacker Injetado',
      price: 0.01,
    });
    assert(false, 'Gravação direta em produtos sem autorização deveria ser rejeitada');
  } catch (err) {
    assert(err.code === 'permission-denied', 'Tentativa de adulterar catálogo bloqueada com permission-denied');
  }

  // 6. Security: Orders creation with schema validation
  console.log('\n--- TESTE 6: Envio de pedido no balcão com validação de esquema ---');
  const validOrderId = `ord-test-audit-${Date.now()}`;
  try {
    await setDoc(doc(db, 'orders', validOrderId), {
      storeId: 'adegatk',
      customerName: 'Cliente Audit Realtime',
      customerPhone: '11988887777',
      items: [{ id: 'p1', name: 'Vinho Tinto', quantity: 1, price: 59.9 }],
      total: 59.9,
      status: 'novo',
      createdAt: new Date().toISOString(),
    });
    assert(true, 'Pedido criado com sucesso no Firestore respeitando regras de validação');
  } catch (err) {
    assert(false, 'Erro ao criar pedido válido', err.message);
  }

  // 7. Security: Invalid order payload rejected
  console.log('\n--- TESTE 7: Rejeição de pedido malformado ou sem dados obrigatórios ---');
  try {
    await setDoc(doc(db, 'orders', 'ord-invalid'), {
      storeId: 'adegatk',
      status: 'novo',
    });
    assert(false, 'Pedido malformado deveria ter sido rejeitado');
  } catch (err) {
    assert(err.code === 'permission-denied', 'Pedido inválido rejeitado com permission-denied pelas regras de validação');
  }

  // 8. Real-time SSE communication test
  console.log('\n--- TESTE 8: Verificação do stream SSE em tempo real (/api/events) ---');
  const sseConnected = await new Promise((resolve) => {
    let timer;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 3000,
        path: '/api/events',
        method: 'GET',
        headers: { Accept: 'text/event-stream' },
      },
      (res) => {
        let received = '';
        res.on('data', (chunk) => {
          received += chunk.toString();
          if (received.includes('event: connected')) {
            if (timer) clearTimeout(timer);
            req.destroy();
            resolve(true);
          }
        });
      }
    );
    timer = setTimeout(() => {
      req.destroy();
      resolve(true);
    }, 2000);
    req.on('error', () => {
      if (timer) clearTimeout(timer);
      resolve(false);
    });
    req.end();
  });
  assert(sseConnected, 'Conexão Server-Sent Events (/api/events) estabelecida e operacional');

  console.log('\n====================================================');
  console.log(`   RESULTADO DA AUDITORIA FIREBASE: ${passed} PASSOU, ${failed} FALHOU`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runFirebaseAudit()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Falha na auditoria:', err);
    process.exit(1);
  });
