const http = require('http');

const PORT = 3000;
const HOST = '127.0.0.1';

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: HOST,
        port: PORT,
        ...options,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(body);
          } catch {
            parsed = body;
          }
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        });
      }
    );

    req.on('error', (err) => reject(err));

    if (data) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      req.write(payload);
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('   INICIANDO BATERIA DE TESTES DE AUTENTICAÇÃO E RBAC');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, extraInfo = '') {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${extraInfo}`);
      failed++;
    }
  }

  // TEST 1: Unauthenticated request to protected endpoints
  console.log('--- TESTE 1: Acesso direto sem login ---');
  const endpointsToTest = [
    { path: '/api/orders', method: 'GET' },
    { path: '/api/customers', method: 'GET' },
    { path: '/api/expenses', method: 'GET' },
    { path: '/api/users', method: 'GET' },
    { path: '/api/auth/verify', method: 'GET' },
    { path: '/api/upload', method: 'POST', body: { data: 'test', mimeType: 'image/png' } },
  ];

  for (const ep of endpointsToTest) {
    const res = await request({
      path: ep.path,
      method: ep.method,
      headers: { 'Content-Type': 'application/json' },
    }, ep.body);
    assert(
      res.status === 401 && res.data.success === false,
      `Bloqueio não autenticado: ${ep.method} ${ep.path}`,
      `(Status retornado: ${res.status})`
    );
  }

  // TEST 2: Request with fake / tampered token
  console.log('\n--- TESTE 2: Acesso com token inválido/forjado ---');
  const fakeTokenRes = await request({
    path: '/api/expenses',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.fakePayload.fakeSignature',
    },
  });
  assert(
    fakeTokenRes.status === 401 && fakeTokenRes.data.success === false,
    'Rejeição de token forjado/inválido para /api/expenses',
    `(Status retornado: ${fakeTokenRes.status})`
  );

  // TEST 3: Login with incorrect password
  console.log('\n--- TESTE 3: Tentativa de login com senha incorreta ---');
  const badLoginRes = await request(
    {
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      email: 'tkadega85@gmail.com',
      password: 'senha_errada_123',
    }
  );
  assert(
    badLoginRes.status === 401 && badLoginRes.data.success === false,
    'Falha esperada com senha incorreta',
    `(Status retornado: ${badLoginRes.status})`
  );

  // TEST 4: Login with correct credentials
  console.log('\n--- TESTE 4: Autenticação real com a senha configurada ---');
  const loginRes = await request(
    {
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      email: 'tkadega85@gmail.com',
      password: 'V9#mQ2!rT8@kL5$xP4zN',
    }
  );
  const adminToken = loginRes.data?.token;
  const adminUser = loginRes.data?.user;

  assert(
    loginRes.status === 200 &&
    loginRes.data.success === true &&
    typeof adminToken === 'string' &&
    adminToken.length > 20 &&
    adminUser.email === 'tkadega85@gmail.com' &&
    adminUser.role === 'admin' &&
    !adminUser.passwordHash,
    'Login administrativo com sucesso e emissão de token HMAC seguro'
  );

  // TEST 5: Verify auth endpoint with valid token
  console.log('\n--- TESTE 5: Verificação de sessão (GET /api/auth/verify) ---');
  const verifyRes = await request({
    path: '/api/auth/verify',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
  assert(
    verifyRes.status === 200 &&
    verifyRes.data.success === true &&
    verifyRes.data.user.email === 'tkadega85@gmail.com',
    'Sessão confirmada via /api/auth/verify'
  );

  // TEST 6: Admin access to protected datasets
  console.log('\n--- TESTE 6: Acesso aos dados administrativos com token válido ---');
  const [ordersRes, expensesRes, customersRes] = await Promise.all([
    request({
      path: '/api/orders',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    }),
    request({
      path: '/api/expenses',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    }),
    request({
      path: '/api/customers',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    }),
  ]);

  assert(ordersRes.status === 200 && ordersRes.data.success === true, 'Acesso autorizado a Pedidos (/api/orders)');
  assert(expensesRes.status === 200 && expensesRes.data.success === true, 'Acesso autorizado a Despesas Financeiras (/api/expenses)');
  assert(customersRes.status === 200 && customersRes.data.success === true, 'Acesso autorizado a Clientes (/api/customers)');

  // TEST 7: Role-based Access Control (RBAC) - Attendant/non-admin blocked from Finances
  console.log('\n--- TESTE 7: Restrição de privilégios (RBAC) ---');
  // Create or test an operator user with 'atendente' role
  const createOperatorRes = await request(
    {
      path: '/api/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    {
      name: 'Atendente Balcao Teste',
      email: 'atendente.teste@adega.com',
      role: 'atendente',
      password: 'senha_atendente_123',
    }
  );

  // Login as the attendant
  const operatorLogin = await request(
    {
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      email: 'atendente.teste@adega.com',
      password: 'senha_atendente_123',
    }
  );
  const operatorToken = operatorLogin.data?.token;

  // Try to access financial expenses with attendant token
  const blockedFinancesRes = await request({
    path: '/api/expenses',
    method: 'GET',
    headers: { Authorization: `Bearer ${operatorToken}` },
  });

  assert(
    blockedFinancesRes.status === 403 && blockedFinancesRes.data.success === false,
    'Operador sem permissão financeira bloqueado em /api/expenses com 403 Forbidden',
    `(Status retornado: ${blockedFinancesRes.status})`
  );

  // TEST 8: Protection of root account deletion
  console.log('\n--- TESTE 8: Proteção da conta principal contra exclusão ---');
  const deleteRootRes = await request({
    path: '/api/users/user-primary-owner',
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(
    deleteRootRes.status === 400 && deleteRootRes.data.success === false,
    'Tentativa de exclusão do proprietário principal rejeitada com sucesso'
  );

  // Clean up operator user created for test
  if (createOperatorRes.data?.user?.id) {
    await request({
      path: `/api/users/${createOperatorRes.data.user.id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  }

  console.log('\n====================================================');
  console.log(`   RESULTADO DOS TESTES: ${passed} PASSOU, ${failed} FALHOU`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Erro na execução dos testes:', err);
  process.exit(1);
});
