require('dotenv').config();

/**
 * Sentralisasi Environment Variables & Konfigurasi Aplikasi.
 * Semua variabel dibaca sekali di file ini untuk mencegah process.env tersebar
 * dan menjamin validitas nilai default serta imutabilitas konfigurasi.
 */
const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'coffeeshop_secret_key_kelompok1_paw2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  bcryptSaltRounds: 10,
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  nodeEnv: process.env.NODE_ENV || 'development'
};

// Immutability protection: mencegah perubahan konfigurasi saat runtime
module.exports = Object.freeze(config);
