const express = require('express');
const router = express.Router();
const { login, getProfile, logout } = require('../controllers/authController');
const { authenticate } = require('../config/auth');

router.post('/login', login);
router.get('/profile', authenticate, getProfile);
router.post('/logout', authenticate, logout);

module.exports = router;
