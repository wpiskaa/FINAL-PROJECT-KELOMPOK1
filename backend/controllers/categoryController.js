const { getDB } = require('../config/database');

function getAllCategories(req, res) {
  const db = getDB();
  const categories = db.prepare(`
    SELECT c.*, COUNT(p.id) as total_products 
    FROM categories c 
    LEFT JOIN products p ON p.category_id = c.id AND p.delete_flag = 0
    GROUP BY c.id 
    ORDER BY c.name ASC
  `).all();

  res.json({
    success: true,
    data: { categories }
  });
}

function getCategoryById(req, res) {
  const db = getDB();
  const { id } = req.params;

  const category = db.prepare(`
    SELECT c.*, COUNT(p.id) as total_products 
    FROM categories c 
    LEFT JOIN products p ON p.category_id = c.id AND p.delete_flag = 0
    WHERE c.id = ?
    GROUP BY c.id
  `).get(id);

  if (!category) {
    return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan.' });
  }

  res.json({
    success: true,
    data: { category }
  });
}

function createCategory(req, res) {
  const db = getDB();
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi.' });
  }

  const trimmedName = name.trim();
  const existing = db.prepare('SELECT id FROM categories WHERE LOWER(name) = LOWER(?)').get(trimmedName);
  if (existing) {
    return res.status(409).json({ success: false, message: 'Kategori dengan nama tersebut sudah ada.' });
  }

  const result = db.prepare('INSERT INTO categories (name) VALUES (?)').run(trimmedName);
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);

  res.status(201).json({
    success: true,
    message: 'Kategori berhasil ditambahkan!',
    data: { category }
  });
}

function updateCategory(req, res) {
  const db = getDB();
  const { id } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi.' });
  }

  const existing = db.prepare('SELECT id FROM categories WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan.' });
  }

  const trimmedName = name.trim();
  const duplicate = db.prepare('SELECT id FROM categories WHERE LOWER(name) = LOWER(?) AND id != ?').get(trimmedName, id);
  if (duplicate) {
    return res.status(409).json({ success: false, message: 'Kategori dengan nama tersebut sudah ada.' });
  }

  db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(trimmedName, id);
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);

  res.json({
    success: true,
    message: 'Kategori berhasil diperbarui!',
    data: { category }
  });
}

function deleteCategory(req, res) {
  const db = getDB();
  const { id } = req.params;

  const existing = db.prepare('SELECT id FROM categories WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan.' });
  }

  // Cek apakah kategori masih dipakai oleh produk aktif
  const usedCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE category_id = ? AND delete_flag = 0').get(id).count;
  if (usedCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Kategori tidak dapat dihapus karena masih digunakan oleh ${usedCount} produk aktif. Silakan ubah kategori produk terkait terlebih dahulu.`
    });
  }

  db.prepare('DELETE FROM categories WHERE id = ?').run(id);

  res.json({
    success: true,
    message: 'Kategori berhasil dihapus!'
  });
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
