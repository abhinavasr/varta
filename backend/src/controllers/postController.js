const { Post, User, PostMedia, PostLike, TokenBalance, TokenTransaction, sequelize } = require('../models');
const { Op } = require('sequelize');

// Create a new post
exports.createPost = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { content } = req.body;
    const userId = req.user.id;
    
    // Check if user has enough tokens (1 token required to post)
    const tokenBalance = await TokenBalance.findOne({ 
      where: { user_id: userId },
      transaction
    });
    
    if (!tokenBalance || tokenBalance.balance < 1) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Insufficient tokens. You need 1 token to create a post.' 
      });
    }
    
    // Create post
    const post = await Post.create({
      user_id: userId,
      content,
      created_at: new Date(),
      updated_at: new Date()
    }, { transaction });
    
    // Handle media uploads if any
    if (req.body.media && req.body.media.length > 0) {
      const mediaPromises = req.body.media.map(media => {
        return PostMedia.create({
          post_id: post.id,
          media_type: media.type,
          media_url: media.url,
          thumbnail_url: media.thumbnail_url || null,
          created_at: new Date()
        }, { transaction });
      });
      
      await Promise.all(mediaPromises);
    }
    
    // Deduct token for post creation
    await tokenBalance.update(
      { 
        balance: sequelize.literal('balance - 1'),
        last_updated: new Date()
      },
      { transaction }
    );
    
    // Record token transaction
    await TokenTransaction.create({
      user_id: userId,
      transaction_type: 'post_creation',
      amount: -1,
      reference_id: post.id,
      reference_type: 'post',
      created_at: new Date(),
      transaction_status: 'completed'
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json({
      message: 'Post created successfully',
      post: {
        id: post.id,
        content: post.content,
        created_at: post.created_at
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
};

// Get all posts (with pagination)
exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const posts = await Post.findAndCountAll({
      where: { is_deleted: false },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profile_image_url']
        },
        {
          model: PostMedia
        },
        {
          model: PostLike,
          as: 'likes',
          attributes: ['id', 'user_id', 'created_at']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });
    
    const totalPages = Math.ceil(posts.count / limit);
    
    res.status(200).json({
      posts: posts.rows,
      pagination: {
        total: posts.count,
        totalPages,
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
};

// Get a single post by ID
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findOne({
      where: { 
        id,
        is_deleted: false
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profile_image_url']
        },
        {
          model: PostMedia
        },
        {
          model: PostLike,
          as: 'likes',
          attributes: ['id', 'user_id', 'created_at']
        }
      ]
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Increment view count
    await post.update({ view_count: post.view_count + 1 });
    
    res.status(200).json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    const post = await Post.findOne({
      where: { 
        id,
        user_id: userId,
        is_deleted: false
      }
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found or you do not have permission to update it' });
    }
    
    await post.update({
      content,
      is_edited: true,
      updated_at: new Date()
    });
    
    res.status(200).json({
      message: 'Post updated successfully',
      post: {
        id: post.id,
        content: post.content,
        updated_at: post.updated_at
      }
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
};

// Delete a post (soft delete)
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const post = await Post.findOne({
      where: { 
        id,
        user_id: userId,
        is_deleted: false
      }
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found or you do not have permission to delete it' });
    }
    
    await post.update({
      is_deleted: true,
      updated_at: new Date()
    });
    
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
};

// Get posts by a specific user
exports.getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const posts = await Post.findAndCountAll({
      where: { 
        user_id: userId,
        is_deleted: false
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profile_image_url']
        },
        {
          model: PostMedia
        },
        {
          model: PostLike,
          as: 'likes',
          attributes: ['id', 'user_id', 'created_at']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });
    
    const totalPages = Math.ceil(posts.count / limit);
    
    res.status(200).json({
      posts: posts.rows,
      pagination: {
        total: posts.count,
        totalPages,
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Error fetching user posts', error: error.message });
  }
};

// Reshare a post
exports.resharePost = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    // Check if original post exists
    const originalPost = await Post.findOne({
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
    
    if (!originalPost) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Original post not found' });
    }
    
    // Check if user has enough tokens (1 token required to reshare)
    const userTokenBalance = await TokenBalance.findOne({ 
      where: { user_id: userId },
      transaction
    });
    
    if (!userTokenBalance || userTokenBalance.balance < 1) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Insufficient tokens. You need 1 token to reshare a post.' 
      });
    }
    
    // Create reshared post
    const resharedPost = await Post.create({
      user_id: userId,
      content: content || originalPost.content,
      original_post_id: originalPost.id,
      is_reshare: true,
      created_at: new Date(),
      updated_at: new Date()
    }, { transaction });
    
    // Deduct token from resharing user
    await userTokenBalance.update(
      { 
        balance: sequelize.literal('balance - 1'),
        last_updated: new Date()
      },
      { transaction }
    );
    
    // Record token deduction transaction
    await TokenTransaction.create({
      user_id: userId,
      transaction_type: 'reshare',
      amount: -1,
      reference_id: resharedPost.id,
      reference_type: 'post_reshare',
      created_at: new Date(),
      transaction_status: 'completed'
    }, { transaction });
    
    // Credit token to original post author
    const originalAuthorTokenBalance = await TokenBalance.findOne({ 
      where: { user_id: originalPost.user_id },
      transaction
    });
    
    if (originalAuthorTokenBalance) {
      await originalAuthorTokenBalance.update(
        { 
          balance: sequelize.literal('balance + 1'),
          last_updated: new Date()
        },
        { transaction }
      );
      
      // Record token credit transaction for original author
      await TokenTransaction.create({
        user_id: originalPost.user_id,
        transaction_type: 'reshare_reward',
        amount: 1,
        reference_id: resharedPost.id,
        reference_type: 'post_reshare',
        created_at: new Date(),
        transaction_status: 'completed'
      }, { transaction });
    }
    
    await transaction.commit();
    
    res.status(201).json({
      message: 'Post reshared successfully',
      post: {
        id: resharedPost.id,
        content: resharedPost.content,
        original_post_id: resharedPost.original_post_id,
        is_reshare: true,
        created_at: resharedPost.created_at
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Reshare post error:', error);
    res.status(500).json({ message: 'Error resharing post', error: error.message });
  }
};
