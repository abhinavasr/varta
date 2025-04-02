const { User, TokenBalance, TokenTransaction, sequelize } = require('../models');

// Get user's token balance
exports.getTokenBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const tokenBalance = await TokenBalance.findOne({
      where: { user_id: userId }
    });
    
    if (!tokenBalance) {
      return res.status(404).json({ message: 'Token balance not found' });
    }
    
    res.status(200).json({
      balance: tokenBalance.balance,
      last_updated: tokenBalance.last_updated
    });
  } catch (error) {
    console.error('Get token balance error:', error);
    res.status(500).json({ message: 'Error fetching token balance', error: error.message });
  }
};

// Get user's token transaction history
exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const transactions = await TokenTransaction.findAndCountAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit,
      offset
    });
    
    const totalPages = Math.ceil(transactions.count / limit);
    
    res.status(200).json({
      transactions: transactions.rows,
      pagination: {
        total: transactions.count,
        totalPages,
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({ message: 'Error fetching transaction history', error: error.message });
  }
};

// Daily login reward (0.5 tokens)
exports.claimDailyReward = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.user.id;
    
    // Check if user already claimed today's reward
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const recentClaim = await TokenTransaction.findOne({
      where: {
        user_id: userId,
        transaction_type: 'daily_login',
        created_at: {
          [sequelize.Op.gte]: today
        }
      },
      transaction
    });
    
    if (recentClaim) {
      await transaction.rollback();
      return res.status(400).json({ message: 'You have already claimed your daily reward today' });
    }
    
    // Update token balance
    const tokenBalance = await TokenBalance.findOne({
      where: { user_id: userId },
      transaction
    });
    
    if (!tokenBalance) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Token balance not found' });
    }
    
    await tokenBalance.update(
      { 
        balance: sequelize.literal('balance + 0.5'),
        last_updated: new Date()
      },
      { transaction }
    );
    
    // Record transaction
    await TokenTransaction.create({
      user_id: userId,
      transaction_type: 'daily_login',
      amount: 0.5,
      created_at: new Date(),
      transaction_status: 'completed'
    }, { transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      message: 'Daily reward claimed successfully',
      reward: 0.5,
      new_balance: parseFloat(tokenBalance.balance) + 0.5
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Claim daily reward error:', error);
    res.status(500).json({ message: 'Error claiming daily reward', error: error.message });
  }
};

// Purchase tokens (simulated for now, would integrate with payment system in production)
exports.purchaseTokens = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Invalid token amount' });
    }
    
    // Update token balance
    const tokenBalance = await TokenBalance.findOne({
      where: { user_id: userId },
      transaction
    });
    
    if (!tokenBalance) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Token balance not found' });
    }
    
    await tokenBalance.update(
      { 
        balance: sequelize.literal(`balance + ${amount}`),
        last_updated: new Date()
      },
      { transaction }
    );
    
    // Record transaction
    await TokenTransaction.create({
      user_id: userId,
      transaction_type: 'purchase',
      amount: amount,
      created_at: new Date(),
      transaction_status: 'completed'
    }, { transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      message: 'Tokens purchased successfully',
      amount: amount,
      new_balance: parseFloat(tokenBalance.balance) + parseFloat(amount)
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Purchase tokens error:', error);
    res.status(500).json({ message: 'Error purchasing tokens', error: error.message });
  }
};

// Get token economy statistics
exports.getTokenStats = async (req, res) => {
  try {
    // Get total tokens in circulation
    const totalTokens = await TokenBalance.sum('balance');
    
    // Get transaction counts by type
    const transactionCounts = await TokenTransaction.findAll({
      attributes: [
        'transaction_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
      ],
      group: ['transaction_type']
    });
    
    // Get user count with tokens
    const userCount = await TokenBalance.count({
      where: {
        balance: {
          [sequelize.Op.gt]: 0
        }
      }
    });
    
    res.status(200).json({
      total_tokens_in_circulation: totalTokens,
      transaction_stats: transactionCounts,
      users_with_tokens: userCount
    });
  } catch (error) {
    console.error('Get token stats error:', error);
    res.status(500).json({ message: 'Error fetching token statistics', error: error.message });
  }
};
