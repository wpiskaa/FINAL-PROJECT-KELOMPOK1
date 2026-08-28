const { getDB } = require('../config/database');
const { generateMenuDescription } = require('../utils/geminiHelper');

function getAllProducts(req, res) {
  const db = getDB();
  const { category_id, search, available } = req.query;

  let query = `
    SELECT p.*, c.name as category_name 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.delete_flag = 0
  `;
  const params = [];

  if (category_id) {
    query += ' AND p.category_id = ?';
    params.push(category_id);
  }
  if (search) {
    query += ' AND p.name LIKE ?';
    params.push(`%${search}%`);
  }
  if (available !== undefined) {
    query += ' AND p.is_available = ?';
    params.push(available === 'true' ? 1 : 0);
  }

  query += ' ORDER BY p.created_at DESC';

  const products = db.prepare(query).all(...params);
  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();

  res.json({
    success: true,
    data: { products, categories }
  });
}

function getProductById(req, res) {
  const db = getDB();
  const { id } = req.params;

  const product = db.prepare(`
    SELECT p.*, c.name as category_name 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ? AND p.delete_flag = 0
  `).get(id);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
  }

  res.json({ success: true, data: { product } });
}

function createProduct(req, res) {
  const db = getDB();
  const { name, description, price, category_id, image_url } = req.body;

  if (!name || !price) {
    return res.status(400).json({ success: false, message: 'Nama dan harga produk wajib diisi.' });
  }

  const result = db.prepare(`
    INSERT INTO products (name, description, price, category_id, image_url) 
    VALUES (?, ?, ?, ?, ?)
  `).run(name, description || '', parseFloat(price), category_id || null, image_url || '');

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ success: true, message: 'Produk berhasil ditambahkan!', data: { product } });
}

function updateProduct(req, res) {
  const db = getDB();
  const { id } = req.params;
  const { name, description, price, category_id, image_url, is_available } = req.body;

  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
  }

  db.prepare(`
    UPDATE products 
    SET name = ?, description = ?, price = ?, category_id = ?, image_url = ?, is_available = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    name, description || '', parseFloat(price), category_id || null,
    image_url || '', is_available !== undefined ? (is_available ? 1 : 0) : 1, id
  );

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  res.json({ success: true, message: 'Produk berhasil diperbarui!', data: { product } });
}

function deleteProduct(req, res) {
  const db = getDB();
  const { id } = req.params;

  const existing = db.prepare('SELECT id FROM products WHERE id = ? AND delete_flag = 0').get(id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
  }

  // Soft delete — set delete_flag = 1, data transaksi lama tetap aman
  db.prepare('UPDATE products SET delete_flag = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
  res.json({ success: true, message: 'Produk berhasil dihapus (soft delete).' });
}

async function generateDescription(req, res) {
  const db = getDB();
  const { id } = req.params;

  const product = db.prepare(`
    SELECT p.*, c.name as category_name 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ? AND p.delete_flag = 0
  `).get(id);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
  }

  try {
    const startTime = Date.now();
    const description = await generateMenuDescription(
      product.name,
      product.category_name || 'Umum',
      product.price
    );
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    res.json({
      success: true,
      message: `Draf deskripsi AI berhasil dibuat dalam ${elapsed}s!`,
      data: {
        product_id: parseInt(id),
        ai_description: description,
        generation_time: `${elapsed}s`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal generate deskripsi AI.' });
  }
}

function saveAiDescription(req, res) {
  const db = getDB();
  const { id } = req.params;
  const { ai_description } = req.body;

  if (ai_description === undefined) {
    return res.status(400).json({ success: false, message: 'Deskripsi AI wajib diisi.' });
  }

  const existing = db.prepare('SELECT id FROM products WHERE id = ? AND delete_flag = 0').get(id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
  }

  db.prepare('UPDATE products SET ai_description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(ai_description, id);

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

  res.json({
    success: true,
    message: 'Deskripsi AI berhasil disetujui & disimpan!',
    data: { product }
  });
}

function getCategories(req, res) {
  const db = getDB();
  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
  res.json({ success: true, data: { categories } });
}

function createCategory(req, res) {
  const db = getDB();
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi.' });
  }

  const existing = db.prepare('SELECT id FROM categories WHERE name = ?').get(name.trim());
  if (existing) {
    return res.status(409).json({ success: false, message: 'Kategori dengan nama tersebut sudah ada.' });
  }

  const result = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name.trim());
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ success: true, message: 'Kategori berhasil ditambahkan!', data: { category } });
}

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, generateDescription, saveAiDescription, getCategories, createCategory };
