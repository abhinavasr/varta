const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import database connection
const sequelize = require('./config/database');
const { up } = require('./migrations/init');

// Import routes
const routes = require('./routes');

// Create Express app
const app = express();

// Middleware
// Get allowed origin from environment variable or use default values
const allowedOrigin = process.env.CORS_ALLOW_ORIGIN || 'https://frontend-dot-varta-455515.uc.r.appspot.com';
const allowedOrigins = ['http://localhost:3000', allowedOrigin];

// Handle OPTIONS preflight requests explicitly
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  }
  
  res.status(204).end();
});

// CORS middleware for all other requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  next();
});

// Also keep the cors middleware as a fallback with the environment variable
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT, DELETE, OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mount API routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Varta API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Initialize database and start server
const PORT = process.env.PORT || 8080;

async function initializeDatabase() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Run migrations
    await up();
    console.log('Database migrations completed successfully.');
    
    return true;
  } catch (error) {
    console.error('Unable to connect to the database or run migrations:', error);
    return false;
  }
}

async function startServer() {
  const dbInitialized = await initializeDatabase();
  
  if (dbInitialized) {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } else {
    console.error('Failed to initialize database. Server not started.');
    process.exit(1);
  }
}

startServer();
