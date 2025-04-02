const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Post = require('./Post');

const PostRating = sequelize.define('PostRating', {
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
  rating: {
    type: DataTypes.STRING(10),
    allowNull: false,
    // 'left', 'right'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  is_rewarded: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reward_amount: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'post_ratings',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['post_id', 'user_id']
    }
  ]
});

// Define associations
PostRating.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(PostRating, { foreignKey: 'user_id' });

PostRating.belongsTo(Post, { foreignKey: 'post_id' });
Post.hasMany(PostRating, { foreignKey: 'post_id' });

module.exports = PostRating;
