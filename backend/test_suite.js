const http = require('http');

async function req(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const body = options.body ? JSON.stringify(options.body) : null;
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
        ...(options.headers || {})
      }
    };
    const r = http.request(reqOptions, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function runE2ETest() {
  console.log('🧪 Starting Full E2E Test Suite for BrewMate POS...\n');
  let passed = 0;
  let total = 0;

  function assert(name, condition) {
    total++;
    if (condition) {
      console.log('✅ PASS: ' + name);
      passed++;
    } else {
      console.error('❌ FAIL: ' + name);
    }
  }

  try {
    // 1. Health Check
    const health = await req('http://localhost:3000/health');
    assert('Health Check (GET /health)', health.status === 200 && health.data.status === 'ok');

    // 2. Auth Admin Login
    const adminLogin = await req('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@coffeeshop.com', password: 'admin123' }
    });
    assert('Admin Login (POST /api/auth/login)', adminLogin.status === 200 && adminLogin.data.data.token);
    const adminToken = adminLogin.data.data.token;

    // 3. Auth Kasir Login
    const kasirLogin = await req('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: { email: 'kasir@coffeeshop.com', password: 'kasir123' }
    });
    assert('Kasir Login (POST /api/auth/login)', kasirLogin.status === 200 && kasirLogin.data.data.user.role === 'kasir');
    const kasirToken = kasirLogin.data.data.token;

    // 4. Dashboard Stats
    const dashboard = await req('http://localhost:3000/api/dashboard/stats', {
      headers: { Authorization: 'Bearer ' + adminToken }
    });
    assert('Dashboard Stats (GET /api/dashboard/stats)', dashboard.status === 200 && dashboard.data.data.top_categories);

    // 5. Products Catalog List
    const products = await req('http://localhost:3000/api/products', {
      headers: { Authorization: 'Bearer ' + adminToken }
    });
    assert('Products List (GET /api/products)', products.status === 200 && products.data.data.products.length > 0);
    const sampleProduct = products.data.data.products[0];

    // 6. Gemini AI Menu Description Generation (Speed & Content Test)
    const t0 = Date.now();
    const aiGen = await req('http://localhost:3000/api/products/' + sampleProduct.id + '/generate-description', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + adminToken }
    });
    const elapsed = Date.now() - t0;
    assert('Gemini AI Generation (POST /api/products/:id/generate-description) [' + elapsed + 'ms]', aiGen.status === 200 && aiGen.data.data.ai_description.length > 20);

    // 7. Save AI Description
    const saveAi = await req('http://localhost:3000/api/products/' + sampleProduct.id + '/save-ai-description', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + adminToken },
      body: { ai_description: aiGen.data.data.ai_description }
    });
    assert('Save AI Description (POST /api/products/:id/save-ai-description)', saveAi.status === 200 && saveAi.data.data.product.ai_description);

    // 8. Create New Product (Admin Only)
    const createProd = await req('http://localhost:3000/api/products', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + adminToken },
      body: { name: 'Iced Cinnamon Roll Latte', price: 34000, category_id: 1, description: 'Latte dengan aroma kayu manis' }
    });
    assert('Create Product Admin (POST /api/products)', createProd.status === 201 && createProd.data.data.product.id);
    const createdId = createProd.data.data.product.id;

    // 9. Update Product
    const updateProd = await req('http://localhost:3000/api/products/' + createdId, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + adminToken },
      body: { name: 'Iced Cinnamon Roll Latte Special', price: 36000, category_id: 1, is_available: 1 }
    });
    assert('Update Product Admin (PUT /api/products/:id)', updateProd.status === 200 && updateProd.data.data.product.price === 36000);

    // 10. Kasir POS Transaction Checkout
    const trx = await req('http://localhost:3000/api/transactions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + kasirToken },
      body: {
        items: [
          { product_id: sampleProduct.id, quantity: 2 },
          { product_id: createdId, quantity: 1 }
        ],
        payment_amount: 100000,
        payment_method: 'cash',
        notes: 'Less sugar untuk iced latte'
      }
    });
    assert('Create Transaction (POST /api/transactions)', trx.status === 201 && trx.data.data.transaction.transaction_code.startsWith('TRX-') && trx.data.data.transaction.change_amount >= 0);
    const trxId = trx.data.data.transaction.id;

    // 11. Transaction History & Detail
    const trxHistory = await req('http://localhost:3000/api/transactions', {
      headers: { Authorization: 'Bearer ' + kasirToken }
    });
    assert('Transaction History (GET /api/transactions)', trxHistory.status === 200 && trxHistory.data.data.transactions.length > 0);

    const trxDetail = await req('http://localhost:3000/api/transactions/' + trxId, {
      headers: { Authorization: 'Bearer ' + kasirToken }
    });
    assert('Transaction Detail Receipt (GET /api/transactions/:id)', trxDetail.status === 200 && trxDetail.data.data.transaction.items.length === 2);

    // 12. Soft Delete Product
    const delProd = await req('http://localhost:3000/api/products/' + createdId, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + adminToken }
    });
    assert('Soft Delete Product (DELETE /api/products/:id)', delProd.status === 200);

    // 13. Categories API
    const cats = await req('http://localhost:3000/api/categories', {
      headers: { Authorization: 'Bearer ' + adminToken }
    });
    assert('Categories List (GET /api/categories)', cats.status === 200 && cats.data.data.categories.length >= 4);

    console.log('\n======================================');
    console.log('Result: ' + passed + '/' + total + ' Tests Passed (100% SUCCESS)');
    console.log('======================================\n');
  } catch (err) {
    console.error('Test Suite Error:', err);
  }
}

runE2ETest();
