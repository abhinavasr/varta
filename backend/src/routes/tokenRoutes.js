const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');
const verifyToken = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// Token operations
router.get('/balance', tokenController.getTokenBalance);
router.get('/transactions', tokenController.getTransactionHistory);
router.post('/daily-reward', tokenController.claimDailyReward);
router.post('/purchase', tokenController.purchaseTokens);
router.get('/stats', tokenController.getTokenStats);

module.exports = router;
