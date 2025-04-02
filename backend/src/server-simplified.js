require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Varta API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV
  });
});

// API status route
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Varta API is operational',
    timestamp: new Date().toISOString(),
    database: 'pending setup'
  });
});

// Auth routes (simplified)
app.post('/api/auth/register', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Registration endpoint (simplified version)',
    user: {
      id: 'sample-user-id',
      username: req.body.username || 'sample-user',
      email: req.body.email || 'sample@example.com'
    },
    token: 'sample-token'
  });
});

app.post('/api/auth/login', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Login endpoint (simplified version)',
    user: {
      id: 'sample-user-id',
      username: 'sample-user',
      email: req.body.email || 'sample@example.com'
    },
    token: 'sample-token'
  });
});

// Posts routes (simplified)
app.get('/api/posts', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Posts endpoint (simplified version)',
    posts: [
      {
        id: 'sample-post-id-1',
        user_id: 'sample-user-id',
        content: 'This is a sample post content',
        created_at: new Date().toISOString(),
        user: {
          username: 'sample-user',
          profile_image_url: null
        },
        likes: [],
        comments: []
      }
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simplified server is running on port ${PORT}`);
});

module.exports = app;
