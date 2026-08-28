# ☕ BrewMate POS — Sistem Kasir Coffee Shop + Gemini AI

> **FINAL-PROJECT-KELOMPOK1** — Pengembangan Aplikasi Web (PAW), Semester Antara 2026

Aplikasi web Point of Sale (POS) untuk coffee shop yang dilengkapi fitur **AI auto-generate deskripsi menu** menggunakan **Google Gemini API**.

---

## 👥 Anggota Kelompok 1

| No | Nama | NIM | Role |
|----|------|-----|------|
| 1  | Safira Dwi Khairunisa | 20240140173 | Project Lead / Frontend |
| 2  | Rossa Kayla Isma Aziz | 20240140215 | Frontend / UI |
| 3  | Anneira Nur Khairani | 20240140178 | Backend / API |
| 4  | Ilham Saputra | 20240140118 | Backend / Database |
| 5  | Hafiz Kurniawan | 20240140024 | AI Integration / Testing |

---

## 🚀 Fitur Utama

- 🔐 **Login & Autentikasi** — JWT-based auth dengan role Admin & Kasir
- 📊 **Dashboard** — Statistik pendapatan harian/bulanan, grafik revenue 7 hari, produk terlaris
- ☕ **Manajemen Menu** — CRUD produk dengan kategori (Admin only)
- 🤖 **AI Deskripsi** — Generate deskripsi menu otomatis dengan **Google Gemini AI** (~2-3 detik)
- 🛒 **Kasir / POS** — Keranjang belanja, pembayaran cash/kartu, hitung kembalian otomatis
- 📜 **Riwayat Transaksi** — Filter per tanggal, expand detail per transaksi

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | React 18 + Vite + Tailwind CSS |
| **Backend** | Node.js + Express.js |
| **Database** | SQLite (better-sqlite3) |
| **Auth** | JWT + bcryptjs |
| **AI** | Google Gemini API (gemini-1.5-flash) |
| **Charts** | Recharts |
| **Icons** | Lucide React |

---

## 📁 Struktur Project

```
FINAL-PROJECT-KELOMPOK1/
├── backend/                    # Express API
│   ├── app.js                  # Entry point
│   ├── config/
│   │   ├── database.js         # SQLite setup & seed data
│   │   └── auth.js             # JWT middleware
│   ├── controllers/
│   │   ├── authController.js   # Login, logout
│   │   ├── productController.js # CRUD + Gemini AI
│   │   ├── transactionController.js
│   │   └── dashboardController.js
│   ├── routes/                 # Express routers
│   ├── utils/
│   │   └── geminiHelper.js     # Google Gemini API integration
│   └── .env.example
│
└── frontend/                   # React + Vite App
    └── src/
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── ProductsPage.jsx
        │   ├── ProductDetailPage.jsx
        │   ├── TransactionPage.jsx
        │   └── HistoryPage.jsx
        ├── components/
        │   ├── Layout.jsx          # Sidebar layout
        │   └── ProductFormModal.jsx
        ├── hooks/
        │   └── useAuth.jsx         # Auth context
        └── utils/
            ├── api.js              # Axios instance
            └── formatters.js       # Rupiah, date format
```

---

## ⚡ Cara Menjalankan

### Prerequisites
- Node.js v18+
- npm

### 1. Clone Repository
```bash
git clone https://github.com/[username]/FINAL-PROJECT-KELOMPOK1.git
cd FINAL-PROJECT-KELOMPOK1
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
# Edit .env — isi GEMINI_API_KEY dengan API key Anda
npm install
npm run dev
```
Backend berjalan di: `http://localhost:3000`

### 3. Setup Frontend (terminal baru)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Frontend berjalan di: `http://localhost:5173`

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
PORT=3000
JWT_SECRET=your_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

> **Mendapatkan Gemini API Key:** Kunjungi [Google AI Studio](https://aistudio.google.com/app/apikey) → Create API Key (GRATIS)

---

## 👤 Default Akun

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@coffeeshop.com | admin123 |
| Kasir | kasir@coffeeshop.com | kasir123 |

---

## 🌐 API Endpoints

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/login` | Login | - |
| GET | `/api/dashboard/stats` | Statistik dashboard | ✅ |
| GET | `/api/products` | List produk | ✅ |
| POST | `/api/products` | Tambah produk | Admin |
| PUT | `/api/products/:id` | Edit produk | Admin |
| DELETE | `/api/products/:id` | Hapus produk | Admin |
| POST | `/api/products/:id/generate-description` | **AI Generate** | ✅ |
| GET | `/api/transactions` | Riwayat transaksi | ✅ |
| POST | `/api/transactions` | Buat transaksi | ✅ |

---

## 📸 Tampilan Aplikasi

> Jalankan aplikasi untuk melihat tampilannya!

---

## 📄 Lisensi

Dibuat untuk keperluan Final Project mata kuliah **Pengembangan Aplikasi Web (PAW)**  
Semester Antara 2026 — Kelompok 1
