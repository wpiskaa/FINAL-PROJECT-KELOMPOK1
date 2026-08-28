const express = require('express');
const router = express.Router();
const { getAllTransactions, getTransactionById, createTransaction } = require('../controllers/transactionController');
const { authenticate } = require('../config/auth');

router.get('/', authenticate, getAllTransactions);
router.get('/:id', authenticate, getTransactionById);
router.post('/', authenticate, createTransaction);

module.exports = router;
