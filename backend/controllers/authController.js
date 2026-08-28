const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'coffeeshop_secret_key';

function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
  }

  const db = getDB();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Email atau password salah.' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ success: false, message: 'Email atau password salah.' });
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    success: true,
    message: 'Login berhasil!',
    data: {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    }
  });
}

function getProfile(req, res) {
  res.json({
    success: true,
    data: { user: req.user }
  });
}

function logout(req, res) {
  res.json({ success: true, message: 'Logout berhasil.' });
}

module.exports = { login, getProfile, logout };
