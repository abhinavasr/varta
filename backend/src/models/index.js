const User = require('./User');
const UserProfile = require('./UserProfile');
const Post = require('./Post');
const PostMedia = require('./PostMedia');
const PostRating = require('./PostRating');
const PostLike = require('./PostLike');
const TokenBalance = require('./TokenBalance');
const TokenTransaction = require('./TokenTransaction');

// Define associations if not already defined in individual models

module.exports = {
  User,
  UserProfile,
  Post,
  PostMedia,
  PostRating,
  PostLike,
  TokenBalance,
  TokenTransaction
};
