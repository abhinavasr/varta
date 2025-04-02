const { Post, User, PostLike, TokenBalance, TokenTransaction, sequelize } = require('../models');
const { Op } = require('sequelize');

// Like a post - costs 0.1 tokens and rewards the original content creator
exports.likePost = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    
    // Check if post exists
    const post = await Post.findOne({
      where: { 
        id: postId,
        is_deleted: false
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        }
      ],
      transaction
    });
    
    if (!post) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user already liked the post
    const existingLike = await PostLike.findOne({
      where: {
        post_id: postId,
        user_id: userId
      },
      transaction
    });
    
    if (existingLike) {
      await transaction.rollback();
      return res.status(400).json({ message: 'You have already liked this post' });
    }
    
    // Check if user has enough tokens (0.1 token required to like)
    const userTokenBalance = await TokenBalance.findOne({ 
      where: { user_id: userId },
      transaction
    });
    
    if (!userTokenBalance || userTokenBalance.balance < 0.1) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Insufficient tokens. You need 0.1 tokens to like a post.' 
      });
    }
    
    // Find the original post if this is a reshared post
    let originalPostAuthorId = post.user_id;
    if (post.is_reshare && post.original_post_id) {
      const originalPost = await Post.findByPk(post.original_post_id, { transaction });
      if (originalPost) {
        originalPostAuthorId = originalPost.user_id;
      }
    }
    
    // Deduct 0.1 token from liking user
    await userTokenBalance.update(
      { 
        balance: sequelize.literal('balance - 0.1'),
        last_updated: new Date()
      },
      { transaction }
    );
    
    // Record token deduction transaction
    const deductionTransaction = await TokenTransaction.create({
      user_id: userId,
      transaction_type: 'like_cost',
      amount: -0.1,
      reference_id: postId,
      reference_type: 'post_like',
      created_at: new Date(),
      transaction_status: 'completed'
    }, { transaction });
    
    // Create the like record
    const like = await PostLike.create({
      post_id: postId,
      user_id: userId,
      created_at: new Date(),
      token_transaction_id: deductionTransaction.id
    }, { transaction });
    
    // Credit 0.1 token to original content creator
    const authorTokenBalance = await TokenBalance.findOne({ 
      where: { user_id: originalPostAuthorId },
      transaction
    });
    
    if (authorTokenBalance) {
      await authorTokenBalance.update(
        { 
          balance: sequelize.literal('balance + 0.1'),
          last_updated: new Date()
        },
        { transaction }
      );
      
      // Record token credit transaction for author
      await TokenTransaction.create({
        user_id: originalPostAuthorId,
        transaction_type: 'like_reward',
        amount: 0.1,
        reference_id: like.id,
        reference_type: 'post_like',
        created_at: new Date(),
        transaction_status: 'completed'
      }, { transaction });
    }
    
    await transaction.commit();
    
    res.status(201).json({
      message: 'Post liked successfully',
      like: {
        id: like.id,
        post_id: like.post_id,
        user_id: like.user_id,
        created_at: like.created_at
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Error liking post', error: error.message });
  }
};

// Unlike a post - does not refund tokens
exports.unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    
    // Check if like exists
    const like = await PostLike.findOne({
      where: {
        post_id: postId,
        user_id: userId
      }
    });
    
    if (!like) {
      return res.status(404).json({ message: 'You have not liked this post' });
    }
    
    // Delete the like
    await like.destroy();
    
    res.status(200).json({ message: 'Post unliked successfully' });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ message: 'Error unliking post', error: error.message });
  }
};

// Get all likes for a post
exports.getPostLikes = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const likes = await PostLike.findAll({
      where: { post_id: postId },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'profile_image_url']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.status(200).json({ likes });
  } catch (error) {
    console.error('Get post likes error:', error);
    res.status(500).json({ message: 'Error fetching post likes', error: error.message });
  }
};

// Check if user has liked a post
exports.checkUserLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    
    const like = await PostLike.findOne({
      where: {
        post_id: postId,
        user_id: userId
      }
    });
    
    res.status(200).json({ hasLiked: !!like });
  } catch (error) {
    console.error('Check user like error:', error);
    res.status(500).json({ message: 'Error checking like status', error: error.message });
  }
};
