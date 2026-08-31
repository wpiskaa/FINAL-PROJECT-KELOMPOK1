# ☕ BrewMate POS — Backend API Documentation

> **Kelompok 1 — Pengembangan Aplikasi Web (PAW)**  
> **Backend & Database Developer:** Ilham Saputra (NIM: `20240140118`)

Backend REST API untuk sistem kasir BrewMate POS dibangun menggunakan Node.js, Express.js, database SQLite (`better-sqlite3`), autentikasi JWT + Bcrypt, dan integrasi Google Gemini API.

---

## 📁 Struktur Direktori Backend

```
backend/
├── app.js                          # Entry point Express, middleware & route loader
├── coffeeshop.db                   # Database file SQLite (WAL mode)
├── config/
│   ├── env.js                      # Sentralisasi konfigurasi environment variables
│   ├── database.js                 # SQLite setup, DDL tabel, indexing & seeders
│   └── auth.js                     # Middleware autentikasi JWT & otorisasi role
├── controllers/
│   ├── authController.js           # Logic login & identitas user
│   ├── categoryController.js       # CRUD kategori & relasi produk
│   ├── productController.js        # CRUD produk & integrasi Gemini AI
│   ├── transactionController.js    # Transaksi kasir (atomic ACID) & riwayat
│   ├── dashboardController.js      # Agregasi statistik, omzet & top categories
│   └── health.controller.js        # Health check endpoint
├── routes/
│   ├── authRoutes.js               # Route /api/auth
│   ├── categoryRoutes.js           # Route /api/categories
│   ├── productRoutes.js            # Route /api/products
│   ├── transactionRoutes.js        # Route /api/transactions
│   ├── dashboardRoutes.js          # Route /api/dashboard
│   └── health.routes.js            # Route /health
├── utils/
│   ├── geminiHelper.js             # Integrasi Google Gemini AI (gemini-1.5-flash)
│   └── response.js                 # Standardized response helper
├── database.md                     # Dokumentasi skema lengkap, ERD & indexing
├── .env.example                    # Template environment variables
└── package.json                    # Backend dependencies & script runner
```

---

## ⚙️ Instalasi & Menjalankan Server

1. **Masuk ke folder backend:**
   ```bash
   cd backend
   ```
2. **Salin environment file & konfigurasikan key:**
   ```bash
   cp .env.example .env
   ```
3. **Instal dependencies:**
   ```bash
   npm install
   ```
4. **Jalankan development server:**
   ```bash
   npm run dev
   ```
   *Server berjalan di: `http://localhost:3000`*

---

## 🔑 Environment Variables (`.env`)

| Variable | Deskripsi | Default / Contoh |
|---|---|---|
| `PORT` | Port server Express | `3000` |
| `FRONTEND_URL` | URL frontend yang diizinkan CORS | `http://localhost:5173` |
| `JWT_SECRET` | Secret key penandatangan token JWT | `brewmate_super_secret_jwt_key_2026` |
| `GEMINI_API_KEY` | API Key dari Google AI Studio | `AIzaSy...` |
| `NODE_ENV` | Environment runtime | `development` |

---

## 🌐 Daftar Endpoint REST API

### 1. 🏥 Health Check
- `GET /health` — Memeriksa status kesehatan server dan koneksi backend.

### 2. 🔐 Autentikasi (`/api/auth`)
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login akun kasir/admin, mengembalikan token JWT |
| GET | `/api/auth/me` | Logged In | Mendapatkan profil akun yang sedang login |

### 3. 🏷️ Kategori Produk (`/api/categories`)
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/api/categories` | Logged In | Mengambil daftar semua kategori beserta jumlah produk |
| GET | `/api/categories/:id` | Logged In | Mengambil detail 1 kategori spesifik |
| POST | `/api/categories` | Admin Only | Membuat kategori menu baru |
| PUT | `/api/categories/:id` | Admin Only | Memperbarui nama kategori |
| DELETE | `/api/categories/:id` | Admin Only | Menghapus kategori (dilindungi jika masih ada produk aktif) |

### 4. ☕ Produk & Menu (`/api/products`)
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/api/products` | Logged In | Mengambil katalog produk (filter: search, category, available) |
| GET | `/api/products/:id` | Logged In | Mengambil detail 1 produk |
| POST | `/api/products` | Admin Only | Menambahkan produk baru ke katalog |
| PUT | `/api/products/:id` | Admin Only | Memperbarui data produk |
| DELETE | `/api/products/:id` | Admin Only | Soft delete produk (aman bagi riwayat transaksi) |
| POST | `/api/products/:id/generate-description` | Logged In | Generate deskripsi menu dengan Google Gemini AI |
| POST | `/api/products/:id/save-ai-description` | Logged In | Simpan deskripsi AI ke database |

### 5. 🛒 Transaksi Kasir (`/api/transactions`)
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/api/transactions` | Logged In | Riwayat transaksi kasir (filter tanggal & pagination) |
| GET | `/api/transactions/:id` | Logged In | Detail transaksi beserta rincian item pembelian |
| POST | `/api/transactions` | Kasir / Admin | Buat transaksi baru secara atomic ACID (`db.transaction()`) |

### 6. 📊 Dashboard Analitik (`/api/dashboard`)
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/api/dashboard/stats` | Logged In | Agregasi penjualan harian, bulanan, grafik 7 hari, top 5 produk, dan ringkasan kategori terlaris (`top_categories`) |

---

## 🗄️ Database & Schema

Dokumentasi lengkap mengenai Entity Relationship Diagram (ERD), skema 5 tabel, strategi indexing, dan query analitik dapat dilihat pada:
👉 **[backend/database.md](file:///c:/SEMESTER%20ANTARA/PENGEMBANGAN%20APLIKASI%20WEB/PAW%20FINAL%20PROJECT/backend/database.md)**
