const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const TokenBalance = sequelize.define('TokenBalance', {
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
    onDelete: 'CASCADE',
    unique: true
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  last_updated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'token_balances',
  timestamps: false
});

// Define association
TokenBalance.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(TokenBalance, { foreignKey: 'user_id' });

module.exports = TokenBalance;
