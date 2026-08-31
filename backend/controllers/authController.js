const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/database');
const config = require('../config/env');

const JWT_SECRET = config.jwtSecret;
const JWT_EXPIRES_IN = config.jwtExpiresIn;

function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email dan password wajib diisi.'
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const db = getDB();
  const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(normalizedEmail);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Email atau password salah.'
    });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Email atau password salah.'
    });
  }

  // Generate JWT Token
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  res.json({
    success: true,
    message: 'Login berhasil! Selamat datang kembali.',
    data: {
      token,
      user: payload
    }
  });
}

function getProfile(req, res) {
  const db = getDB();
  const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(req.user.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Pengguna tidak ditemukan.'
    });
  }

  res.json({
    success: true,
    data: { user }
  });
}

function logout(req, res) {
  res.json({
    success: true,
    message: 'Logout berhasil. Sesi telah diakhiri.'
  });
}

module.exports = { login, getProfile, logout };
