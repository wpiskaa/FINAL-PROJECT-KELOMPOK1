const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'coffeeshop_secret_key';

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token tidak ditemukan. Silakan login.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Token tidak valid atau sudah kadaluarsa.' });
  }
}

function authorizeAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Hanya admin yang dapat mengakses fitur ini.' });
  }
  next();
}

module.exports = { authenticate, authorizeAdmin };
