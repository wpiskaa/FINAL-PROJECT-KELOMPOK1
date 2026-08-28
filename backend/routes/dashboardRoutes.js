const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { authenticate } = require('../config/auth');

router.get('/stats', authenticate, getDashboardStats);

module.exports = router;
