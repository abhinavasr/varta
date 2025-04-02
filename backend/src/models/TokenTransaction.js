const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const TokenTransaction = sequelize.define('TokenTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  transaction_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    // 'post_creation', 'review_creation', 'like_cost', 'like_reward', 'reshare', 'reshare_reward', etc.
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    // positive for credits, negative for debits
  },
  reference_id: {
    type: DataTypes.UUID,
    allowNull: true,
    // can reference post_id, review_id, etc.
  },
  reference_type: {
    type: DataTypes.STRING(20),
    allowNull: true,
    // 'post', 'review', 'post_rating', 'post_reshare', etc.
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  transaction_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'completed',
    // 'pending', 'completed', 'failed'
  },
  transaction_hash: {
    type: DataTypes.STRING(255),
    allowNull: true,
    // blockchain transaction hash if applicable
  }
}, {
  tableName: 'token_transactions',
  timestamps: false
});

// Define association
TokenTransaction.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(TokenTransaction, { foreignKey: 'user_id' });

module.exports = TokenTransaction;
