const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Post = sequelize.define('Post', {
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
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_edited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_pinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  left_rating_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  right_rating_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  weighted_consensus: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  // For reshared posts
  original_post_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'posts',
      key: 'id'
    }
  },
  is_reshare: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'posts',
  timestamps: false
});

// Define associations
Post.belongsTo(User, { foreignKey: 'user_id', as: 'author' });
User.hasMany(Post, { foreignKey: 'user_id' });

// Self-reference for reshared posts
Post.belongsTo(Post, { foreignKey: 'original_post_id', as: 'originalPost' });
Post.hasMany(Post, { foreignKey: 'original_post_id', as: 'reshares' });

module.exports = Post;
