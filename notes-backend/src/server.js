require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');
const notesRoutes = require('./routes/notesRoutes');
const errorHandler = require('./middleware/errorHandler');
const groqChatRoutes = require('./routes/groqChatRoutes');

// --- DYNAMODB IMPLEMENTATION START ---
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

// Initialize DynamoDB Client
// The region 'us-east-1' is standard for AWS Learner Labs
const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

// Attach docClient to the app so it can be accessed in your route files
app.set('db', docClient); 
// --- DYNAMODB IMPLEMENTATION END ---

const app = express();
const PORT = process.env.PORT || 8081;

// CORS Configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*', // Changed to '*' for easier EC2 access
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request Logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/chat', groqChatRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// ERROR HANDLER (Must be last)
app.use(errorHandler);

// SERVER START
const server = app.listen(PORT, () => {
  logger.info(`\n╔════════════════════════════════════════╗`);
  logger.info(`║   Notes API Server Started             ║`);
  logger.info(`║   Port: ${PORT}                           ║`);
  logger.info(`║   Env: ${process.env.NODE_ENV || 'development'}           ║`);
  logger.info(`╚════════════════════════════════════════╝\n`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  logger.warn('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = app;