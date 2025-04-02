const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Post = require('./Post');

const PostLike = sequelize.define('PostLike', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  post_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'posts',
      key: 'id'
    },
    onDelete: 'CASCADE'
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
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  token_transaction_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'token_transactions',
      key: 'id'
    }
  }
}, {
  tableName: 'post_likes',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['post_id', 'user_id']
    }
  ]
});

// Define associations
PostLike.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(PostLike, { foreignKey: 'user_id' });

PostLike.belongsTo(Post, { foreignKey: 'post_id' });
Post.hasMany(PostLike, { foreignKey: 'post_id', as: 'likes' });

module.exports = PostLike;
