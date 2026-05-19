const express = require('express');
const { getBalance, topUp, transfer } = require('../controllers/walletController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// All wallet routes are protected
router.use(authMiddleware);

router.get('/balance', getBalance);
router.post('/topup', topUp);
router.post('/transfer', transfer);

module.exports = router;