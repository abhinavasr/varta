const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const postRoutes = require('./postRoutes');
const likeRoutes = require('./likeRoutes');
const tokenRoutes = require('./tokenRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/likes', likeRoutes);
router.use('/tokens', tokenRoutes);

module.exports = router;
