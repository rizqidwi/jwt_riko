const { 
  findUserByEmail, 
  findUserById, 
  updateUserBalance, 
  createTransaction,
  getWalletData 
} = require('../config/db');

const getBalance = async (req, res) => {
  try {
    const walletData = getWalletData(req.user.id);
    
    if (!walletData) {
      return res.status(404).json({
        success: false,
        message: 'Wallet data not found.'
      });
    }
    
    res.json({
      success: true,
      message: 'Wallet data retrieved successfully.',
      data: {
        user: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email
        },
        balance: walletData.balance,
        transactions: walletData.transactions.map(t => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          from_user_id: t.from_user_id,
          to_user_id: t.to_user_id,
          description: t.description,
          timestamp: t.timestamp
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

const topUp = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0.'
      });
    }
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Please provide a valid positive number.'
      });
    }
    
    const newBalance = req.user.balance + amountNum;
    const updatedUser = updateUserBalance(req.user.id, newBalance);
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }
    
    const transaction = createTransaction({
      type: 'TOPUP',
      amount: amountNum,
      from_user_id: null,
      to_user_id: req.user.id,
      description: `Top up balance of ${amountNum}`
    });
    
    if (req.logger) {
      req.logger.info(`Top Up - User ${req.user.username} (${req.user.email}) topped up ${amountNum}. New balance: ${newBalance}`);
    }
    
    res.json({
      success: true,
      message: 'Top up successful.',
      data: {
        balance: newBalance,
        transaction: {
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          timestamp: transaction.timestamp
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

const transfer = async (req, res) => {
  try {
    const { target_email, amount } = req.body;
    
    if (!target_email || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Target email and amount are required.'
      });
    }
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Please provide a valid positive number.'
      });
    }
    
    const targetUser = findUserByEmail(target_email);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found.'
      });
    }
    
    if (targetUser.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot transfer money to yourself.'
      });
    }
    
    if (req.user.balance < amountNum) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance.'
      });
    }
    
    const senderNewBalance = req.user.balance - amountNum;
    const receiverNewBalance = targetUser.balance + amountNum;
    
    updateUserBalance(req.user.id, senderNewBalance);
    updateUserBalance(targetUser.id, receiverNewBalance);
    
    createTransaction({
      type: 'TRANSFER_OUT',
      amount: amountNum,
      from_user_id: req.user.id,
      to_user_id: targetUser.id,
      description: `Transfer to ${targetUser.email}`
    });
    
    createTransaction({
      type: 'TRANSFER_IN',
      amount: amountNum,
      from_user_id: req.user.id,
      to_user_id: targetUser.id,
      description: `Transfer from ${req.user.email}`
    });
    
    if (req.logger) {
      req.logger.info(`Transfer - User ${req.user.username} (${req.user.email}) transferred ${amountNum} to ${targetUser.username} (${target_email})`);
    }
    
    res.json({
      success: true,
      message: 'Transfer successful.',
      data: {
        from: {
          email: req.user.email,
          balance: senderNewBalance
        },
        to: {
          email: targetUser.email,
          balance: receiverNewBalance
        },
        amount: amountNum
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

module.exports = {
  getBalance,
  topUp,
  transfer
};