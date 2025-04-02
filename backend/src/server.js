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
app.use(cors());
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
