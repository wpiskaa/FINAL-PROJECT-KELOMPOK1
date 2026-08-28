const { getDB } = require('../config/database');

function generateTransactionCode() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.getTime().toString().slice(-6);
  return `TRX-${dateStr}-${timeStr}`;
}

function getAllTransactions(req, res) {
  const db = getDB();
  const { page = 1, limit = 20, date } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = `
    SELECT t.*, u.name as cashier_name
    FROM transactions t
    JOIN users u ON t.cashier_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (date) {
    query += ' AND DATE(t.created_at) = ?';
    params.push(date);
  }

  query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  const transactions = db.prepare(query).all(...params);
  
  // Get items for each transaction
  const transactionsWithItems = transactions.map(t => {
    const items = db.prepare('SELECT * FROM transaction_items WHERE transaction_id = ?').all(t.id);
    return { ...t, items };
  });

  const total = db.prepare('SELECT COUNT(*) as count FROM transactions').get().count;

  res.json({
    success: true,
    data: {
      transactions: transactionsWithItems,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    }
  });
}

function getTransactionById(req, res) {
  const db = getDB();
  const { id } = req.params;

  const transaction = db.prepare(`
    SELECT t.*, u.name as cashier_name
    FROM transactions t
    JOIN users u ON t.cashier_id = u.id
    WHERE t.id = ?
  `).get(id);

  if (!transaction) {
    return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan.' });
  }

  const items = db.prepare('SELECT * FROM transaction_items WHERE transaction_id = ?').all(id);
  res.json({ success: true, data: { transaction: { ...transaction, items } } });
}

function createTransaction(req, res) {
  const db = getDB();
  const { items, payment_amount, payment_method = 'cash', notes = '' } = req.body;
  const cashier_id = req.user.id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Item transaksi wajib diisi.' });
  }

  // Calculate total
  let total_amount = 0;
  const itemDetails = [];

  for (const item of items) {
    const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_available = 1').get(item.product_id);
    if (!product) {
      return res.status(400).json({ success: false, message: `Produk ID ${item.product_id} tidak ditemukan atau tidak tersedia.` });
    }
    const subtotal = product.price * item.quantity;
    total_amount += subtotal;
    itemDetails.push({ product, quantity: item.quantity, subtotal });
  }

  if (parseFloat(payment_amount) < total_amount) {
    return res.status(400).json({ success: false, message: 'Jumlah pembayaran kurang dari total belanja.' });
  }

  const change_amount = parseFloat(payment_amount) - total_amount;
  const transaction_code = generateTransactionCode();

  // Use transaction for data consistency
  const insertTransaction = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO transactions (transaction_code, cashier_id, total_amount, payment_amount, change_amount, payment_method, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(transaction_code, cashier_id, total_amount, parseFloat(payment_amount), change_amount, payment_method, notes);

    const transaction_id = result.lastInsertRowid;

    for (const item of itemDetails) {
      db.prepare(`
        INSERT INTO transaction_items (transaction_id, product_id, product_name, product_price, quantity, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(transaction_id, item.product.id, item.product.name, item.product.price, item.quantity, item.subtotal);
    }

    return transaction_id;
  });

  const transaction_id = insertTransaction();
  const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(transaction_id);
  const savedItems = db.prepare('SELECT * FROM transaction_items WHERE transaction_id = ?').all(transaction_id);

  res.status(201).json({
    success: true,
    message: 'Transaksi berhasil dibuat!',
    data: { transaction: { ...transaction, items: savedItems } }
  });
}

module.exports = { getAllTransactions, getTransactionById, createTransaction };
