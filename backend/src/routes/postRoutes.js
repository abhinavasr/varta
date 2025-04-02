const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const verifyToken = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// Post CRUD operations
router.post('/', postController.createPost);
router.get('/', postController.getPosts);
router.get('/:id', postController.getPostById);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

// User posts
router.get('/user/:userId', postController.getUserPosts);

// Reshare post
router.post('/:postId/reshare', postController.resharePost);

module.exports = router;
