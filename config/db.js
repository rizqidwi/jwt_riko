// In-Memory Database

// Users collection
const users = [];

// Transactions collection
const transactions = [];

// Counter for auto-increment ID
let userIdCounter = 1;
let transactionIdCounter = 1;

// Helper functions
const findUserByEmail = (email) => {
  return users.find(user => user.email === email);
};

const findUserById = (id) => {
  return users.find(user => user.id === id);
};

const findUserByUsername = (username) => {
  return users.find(user => user.username === username);
};

const createUser = (userData) => {
  const newUser = {
    id: userIdCounter++,
    ...userData,
    balance: 0,
    createdAt: new Date()
  };
  users.push(newUser);
  return newUser;
};

const updateUserBalance = (userId, newBalance) => {
  const user = findUserById(userId);
  if (user) {
    user.balance = newBalance;
    return user;
  }
  return null;
};

const createTransaction = (transactionData) => {
  const newTransaction = {
    id: transactionIdCounter++,
    ...transactionData,
    timestamp: new Date()
  };
  transactions.push(newTransaction);
  return newTransaction;
};

const getUserTransactions = (userId) => {
  return transactions.filter(t => t.from_user_id === userId || t.to_user_id === userId)
    .sort((a, b) => b.timestamp - a.timestamp);
};

const getWalletData = (userId) => {
  const user = findUserById(userId);
  if (!user) return null;
  
  return {
    balance: user.balance,
    transactions: getUserTransactions(userId)
  };
};

module.exports = {
  users,
  transactions,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  createUser,
  updateUserBalance,
  createTransaction,
  getUserTransactions,
  getWalletData
};
