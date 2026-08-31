const jwt = require('jsonwebtoken');
const config = require('./env');

const JWT_SECRET = config.jwtSecret;

/**
 * Middleware Autentikasi JWT
 * Memverifikasi token Bearer pada header Authorization
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Token otentikasi tidak ditemukan. Silakan login terlebih dahulu.'
    });
  }

  // Ekstrak Bearer Token
  const parts = authHeader.trim().split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return res.status(401).json({
      success: false,
      message: 'Format header Authorization harus berupa Bearer <token>.'
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Sesi login Anda telah berakhir (token kadaluarsa). Silakan login kembali.'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Token otentikasi tidak valid atau rusak.'
    });
  }
}

/**
 * Middleware Otorisasi Role Admin (RBAC)
 * Memastikan endpoint hanya dapat diakses oleh user dengan role 'admin'
 */
function authorizeAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak: Fitur ini hanya dapat diakses oleh Administrator.'
    });
  }
  next();
}

module.exports = { authenticate, authorizeAdmin };
