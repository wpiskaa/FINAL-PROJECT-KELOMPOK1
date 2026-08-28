const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'coffeeshop.db');

let db;

function getDB() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDB() {
  const db = getDB();

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'kasir',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      ai_description TEXT DEFAULT '',
      price REAL NOT NULL,
      category_id INTEGER,
      image_url TEXT DEFAULT '',
      is_available INTEGER DEFAULT 1,
      delete_flag INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // Transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_code TEXT UNIQUE NOT NULL,
      cashier_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      payment_amount REAL NOT NULL,
      change_amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'cash',
      status TEXT DEFAULT 'completed',
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cashier_id) REFERENCES users(id)
    )
  `);

  // Transaction items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transaction_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      product_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Seed default data
  seedData(db);
  
  console.log('✅ Database initialized successfully');
}

function seedData(db) {
  // Check if admin exists
  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@coffeeshop.com');
  
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)
    `).run('Admin', 'admin@coffeeshop.com', hashedPassword, 'admin');

    const kasirPassword = bcrypt.hashSync('kasir123', 10);
    db.prepare(`
      INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)
    `).run('Kasir Utama', 'kasir@coffeeshop.com', kasirPassword, 'kasir');

    console.log('✅ Default users created (admin@coffeeshop.com / admin123)');
  }

  // Check if categories exist
  const catExists = db.prepare('SELECT id FROM categories LIMIT 1').get();
  if (!catExists) {
    const insertCat = db.prepare('INSERT INTO categories (name) VALUES (?)');
    const cats = ['Kopi', 'Non-Kopi', 'Makanan', 'Minuman Lain'];
    cats.forEach(c => insertCat.run(c));

    // Seed products
    const insertProd = db.prepare(`
      INSERT INTO products (name, description, price, category_id, image_url) VALUES (?, ?, ?, ?, ?)
    `);

    const products = [
      ['Espresso', 'Kopi espresso klasik', 18000, 1, ''],
      ['Americano', 'Espresso dengan air panas', 20000, 1, ''],
      ['Cappuccino', 'Espresso dengan susu foam', 25000, 1, ''],
      ['Latte', 'Espresso dengan susu segar', 27000, 1, ''],
      ['Caramel Macchiato', 'Latte dengan saus karamel', 32000, 1, ''],
      ['Matcha Latte', 'Green tea matcha dengan susu', 28000, 2, ''],
      ['Chocolate Frappe', 'Minuman coklat dingin blended', 30000, 2, ''],
      ['Croissant', 'Pastry renyah mentega', 22000, 3, ''],
      ['Banana Bread', 'Roti pisang lembut', 20000, 3, ''],
      ['Cheesecake', 'Kue keju creamy', 35000, 3, ''],
    ];

    products.forEach(p => insertProd.run(...p));
    console.log('✅ Sample products seeded');
  }
}

module.exports = { getDB, initDB };
