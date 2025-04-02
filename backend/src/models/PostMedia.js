const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Post = require('./Post');

const PostMedia = sequelize.define('PostMedia', {
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
  media_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    // 'image', 'video', etc.
  },
  media_url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  thumbnail_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'post_media',
  timestamps: false
});

// Define association
PostMedia.belongsTo(Post, { foreignKey: 'post_id' });
Post.hasMany(PostMedia, { foreignKey: 'post_id' });

module.exports = PostMedia;
