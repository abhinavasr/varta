const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const verifyToken = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// Like operations
router.post('/posts/:postId', likeController.likePost);
router.delete('/posts/:postId', likeController.unlikePost);
router.get('/posts/:postId', likeController.getPostLikes);
router.get('/posts/:postId/check', likeController.checkUserLike);

module.exports = router;
