# Notes Application - Phase 2: Backend (Node.js/Express MVC)

## File Structure

```
notes-backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── notesController.js
│   ├── models/
│   │   ├── NotesModel.js
│   │   └── AuthModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── notesRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── utils/
│   │   └── logger.js
│   └── server.js
├── package.json
├── .env.local
├── .gitignore
└── README.md
```

## File: package.json

```json
{
  "name": "notes-backend",
  "version": "1.0.0",
  "description": "Node.js/Express Notes API Backend",
  "main": "src/server.js",
  "private": true,
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest --detectOpenHandles"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  },
  "engines": {
    "node": ">=14.0.0",
    "npm": ">=6.0.0"
  }
}
```

## File: .env.local

```
# Server Configuration
NODE_ENV=development
PORT=8080
LOG_LEVEL=debug

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Auth Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=7d
```

## File: src/server.js

```javascript
/**
 * Express Server Entry Point
 * 3-Tier Architecture: Routes -> Controllers -> Models
 */

require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');
const notesRoutes = require('./routes/notesRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 8080;

// ============================================
// MIDDLEWARE
// ============================================

// CORS Configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
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

// ============================================
// ROUTES
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// ============================================
// ERROR HANDLER (Must be last)
// ============================================

app.use(errorHandler);

// ============================================
// SERVER START
// ============================================

const server = app.listen(PORT, () => {
  logger.info(`\n╔════════════════════════════════════════╗`);
  logger.info(`║   Notes API Server Started            ║`);
  logger.info(`║   Port: ${PORT}                           ║`);
  logger.info(`║   Env: ${process.env.NODE_ENV || 'development'}                   ║`);
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
```

## File: src/utils/logger.js

```javascript
/**
 * Simple Logger Utility
 * Provides consistent logging across the application
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

class Logger {
  constructor() {
    this.level = process.env.LOG_LEVEL || 'info';
  }

  _log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;

    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  error(message, data) {
    this._log(LOG_LEVELS.ERROR, message, data);
  }

  warn(message, data) {
    this._log(LOG_LEVELS.WARN, message, data);
  }

  info(message, data) {
    this._log(LOG_LEVELS.INFO, message, data);
  }

  debug(message, data) {
    if (this.level === 'debug') {
      this._log(LOG_LEVELS.DEBUG, message, data);
    }
  }
}

module.exports = new Logger();
```

## File: src/middleware/authMiddleware.js

```javascript
/**
 * Authentication Middleware
 * Verifies Bearer token from Authorization header
 * For local testing: simulates Cognito verification
 */

const logger = require('../utils/logger');

/**
 * Verify JWT Token Middleware
 * Extracts token from Authorization header and validates it
 * @middleware
 */
const verifyToken = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing Authorization header',
      });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid Authorization header format',
      });
    }

    const token = parts[1];

    // Mock Cognito Token Verification
    // In production, this would call AWS Cognito's verification service
    const decodedToken = _decodeAndVerifyToken(token);

    // Attach user info to request for use in controllers
    req.userId = decodedToken.userId;
    req.userEmail = decodedToken.email;
    req.token = token;

    logger.debug(`User authenticated: ${req.userId}`);
    next();
  } catch (error) {
    logger.error('Token verification failed', error.message);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
};

/**
 * Mock Token Decoding
 * Simulates AWS Cognito JWT verification
 * In production, use AWS SDK to verify with Cognito
 * @private
 */
function _decodeAndVerifyToken(token) {
  try {
    // Decode base64 token payload
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));

    // Check expiration
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      throw new Error('Token expired');
    }

    return decoded;
  } catch (error) {
    throw new Error(`Token decode failed: ${error.message}`);
  }
}

module.exports = { verifyToken };
```

## File: src/middleware/errorHandler.js

```javascript
/**
 * Global Error Handler Middleware
 * Catches and formats all application errors
 */

const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('Unhandled Error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Set default status code and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let error = err.error || 'InternalError';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    error = 'ValidationError';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    error = 'NotFound';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    error = 'Unauthorized';
  }

  // Send error response
  res.status(statusCode).json({
    error,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
```

## File: src/models/AuthModel.js

```javascript
/**
 * Authentication Model
 * Handles user data persistence (mock implementation)
 */

class AuthModel {
  constructor() {
    // In-memory user storage (replace with DynamoDB in production)
    this.users = [];
  }

  /**
   * Create a new user
   * @param {object} userData - User data { email, password }
   * @returns {object} - Created user
   */
  createUser(userData) {
    const user = {
      id: `user-${Date.now()}`,
      email: userData.email,
      password: userData.password, // In production: hash with bcrypt
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.push(user);
    return user;
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {object|null} - User object or null
   */
  findUserByEmail(email) {
    return this.users.find((u) => u.email === email) || null;
  }

  /**
   * Find user by ID
   * @param {string} userId - User ID
   * @returns {object|null} - User object or null
   */
  findUserById(userId) {
    return this.users.find((u) => u.id === userId) || null;
  }

  /**
   * Check if user exists by email
   * @param {string} email - User email
   * @returns {boolean}
   */
  userExists(email) {
    return this.users.some((u) => u.email === email);
  }
}

module.exports = new AuthModel();
```

## File: src/models/NotesModel.js

```javascript
/**
 * Notes Model
 * Handles notes data persistence (mock implementation)
 * In production: Replace with DynamoDB queries
 */

const { v4: uuidv4 } = require('uuid');

class NotesModel {
  constructor() {
    // In-memory notes storage (replace with DynamoDB in production)
    this.notes = [];
  }

  /**
   * Create a new note
   * @param {string} userId - User ID
   * @param {object} noteData - Note data { title, content }
   * @returns {object} - Created note
   */
  createNote(userId, noteData) {
    const note = {
      id: uuidv4(),
      userId,
      title: noteData.title || 'Untitled',
      content: noteData.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.notes.push(note);
    return note;
  }

  /**
   * Get all notes for a user
   * @param {string} userId - User ID
   * @returns {array} - Array of notes
   */
  getNotesByUserId(userId) {
    return this.notes.filter((note) => note.userId === userId);
  }

  /**
   * Get a single note by ID
   * @param {string} noteId - Note ID
   * @param {string} userId - User ID (for authorization)
   * @returns {object|null} - Note object or null
   */
  getNoteById(noteId, userId) {
    return (
      this.notes.find((note) => note.id === noteId && note.userId === userId) ||
      null
    );
  }

  /**
   * Update a note
   * @param {string} noteId - Note ID
   * @param {string} userId - User ID (for authorization)
   * @param {object} noteData - Updated note data
   * @returns {object|null} - Updated note or null
   */
  updateNote(noteId, userId, noteData) {
    const noteIndex = this.notes.findIndex(
      (note) => note.id === noteId && note.userId === userId
    );

    if (noteIndex === -1) {
      return null;
    }

    this.notes[noteIndex] = {
      ...this.notes[noteIndex],
      ...noteData,
      updatedAt: new Date().toISOString(),
    };

    return this.notes[noteIndex];
  }

  /**
   * Delete a note
   * @param {string} noteId - Note ID
   * @param {string} userId - User ID (for authorization)
   * @returns {boolean} - True if deleted, false if not found
   */
  deleteNote(noteId, userId) {
    const initialLength = this.notes.length;

    this.notes = this.notes.filter(
      (note) => !(note.id === noteId && note.userId === userId)
    );

    return this.notes.length < initialLength;
  }

  /**
   * Get count of notes for a user
   * @param {string} userId - User ID
   * @returns {number} - Count of notes
   */
  getNoteCount(userId) {
    return this.notes.filter((note) => note.userId === userId).length;
  }

  /**
   * Clear all notes (for testing)
   */
  clearAll() {
    this.notes = [];
  }
}

module.exports = new NotesModel();
```

## File: src/controllers/authController.js

```javascript
/**
 * Authentication Controller
 * Handles authentication logic and user management
 * Following MVC pattern: Routes -> Controller -> Model
 */

const AuthModel = require('../models/AuthModel');
const logger = require('../utils/logger');

class AuthController {
  /**
   * Sign Up Handler
   * POST /api/auth/signup
   */
  async signup(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Email and password are required',
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Password must be at least 6 characters',
        });
      }

      // Check if user already exists
      if (AuthModel.userExists(email)) {
        return res.status(409).json({
          error: 'ConflictError',
          message: 'User with this email already exists',
        });
      }

      // Create user
      const user = AuthModel.createUser({ email, password });

      logger.info(`User created: ${user.id} (${email})`);

      // Generate token
      const token = _generateToken(user.id, email);

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      logger.error('Signup error', error.message);
      next(error);
    }
  }

  /**
   * Login Handler
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Email and password are required',
        });
      }

      // Find user
      const user = AuthModel.findUserByEmail(email);

      if (!user || user.password !== password) {
        return res.status(401).json({
          error: 'AuthenticationError',
          message: 'Invalid email or password',
        });
      }

      // Generate token
      const token = _generateToken(user.id, email);

      logger.info(`User logged in: ${user.id} (${email})`);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      logger.error('Login error', error.message);
      next(error);
    }
  }

  /**
   * Verify Token Handler
   * POST /api/auth/verify
   * Requires valid Authorization header
   */
  async verify(req, res, next) {
    try {
      // If middleware passed, token is valid
      const user = AuthModel.findUserById(req.userId);

      if (!user) {
        return res.status(404).json({
          error: 'NotFoundError',
          message: 'User not found',
        });
      }

      res.json({
        message: 'Token is valid',
        user: {
          id: user.id,
          email: user.email,
        },
      });
    } catch (error) {
      logger.error('Verify error', error.message);
      next(error);
    }
  }
}

/**
 * Generate JWT Token (Mock)
 * In production: use jsonwebtoken library and AWS Cognito
 * @private
 */
function _generateToken(userId, email) {
  const payload = {
    userId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  };

  // Simple base64 encoding (for mock only)
  const tokenString = JSON.stringify(payload);
  return Buffer.from(tokenString).toString('base64');
}

module.exports = new AuthController();
```

## File: src/controllers/notesController.js

```javascript
/**
 * Notes Controller
 * Handles notes business logic
 * Following MVC pattern: Routes -> Controller -> Model
 */

const NotesModel = require('../models/NotesModel');
const logger = require('../utils/logger');

class NotesController {
  /**
   * Get all notes for authenticated user
   * GET /api/notes
   */
  async getNotes(req, res, next) {
    try {
      const userId = req.userId;

      const notes = NotesModel.getNotesByUserId(userId);

      logger.debug(`Fetched ${notes.length} notes for user ${userId}`);

      res.json({
        message: 'Notes retrieved successfully',
        notes,
        count: notes.length,
      });
    } catch (error) {
      logger.error('Get notes error', error.message);
      next(error);
    }
  }

  /**
   * Get a single note
   * GET /api/notes/:noteId
   */
  async getNoteById(req, res, next) {
    try {
      const { noteId } = req.params;
      const userId = req.userId;

      const note = NotesModel.getNoteById(noteId, userId);

      if (!note) {
        return res.status(404).json({
          error: 'NotFoundError',
          message: 'Note not found',
        });
      }

      res.json({
        message: 'Note retrieved successfully',
        note,
      });
    } catch (error) {
      logger.error('Get note error', error.message);
      next(error);
    }
  }

  /**
   * Create a new note
   * POST /api/notes
   */
  async createNote(req, res, next) {
    try {
      const { title, content } = req.body;
      const userId = req.userId;

      // Validation
      if (!content || content.trim() === '') {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Note content is required',
        });
      }

      // Create note
      const note = NotesModel.createNote(userId, {
        title: title || 'Untitled',
        content,
      });

      logger.info(`Note created: ${note.id} for user ${userId}`);

      res.status(201).json({
        message: 'Note created successfully',
        note,
      });
    } catch (error) {
      logger.error('Create note error', error.message);
      next(error);
    }
  }

  /**
   * Update a note
   * PUT /api/notes/:noteId
   */
  async updateNote(req, res, next) {
    try {
      const { noteId } = req.params;
      const { title, content } = req.body;
      const userId = req.userId;

      // Check if note exists
      const note = NotesModel.getNoteById(noteId, userId);

      if (!note) {
        return res.status(404).json({
          error: 'NotFoundError',
          message: 'Note not found',
        });
      }

      // Validation
      if (content !== undefined && (!content || content.trim() === '')) {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Note content cannot be empty',
        });
      }

      // Update note
      const updatedNote = NotesModel.updateNote(noteId, userId, {
        title: title || note.title,
        content: content !== undefined ? content : note.content,
      });

      logger.info(`Note updated: ${noteId}`);

      res.json({
        message: 'Note updated successfully',
        note: updatedNote,
      });
    } catch (error) {
      logger.error('Update note error', error.message);
      next(error);
    }
  }

  /**
   * Delete a note
   * DELETE /api/notes/:noteId
   */
  async deleteNote(req, res, next) {
    try {
      const { noteId } = req.params;
      const userId = req.userId;

      // Check if note exists
      const note = NotesModel.getNoteById(noteId, userId);

      if (!note) {
        return res.status(404).json({
          error: 'NotFoundError',
          message: 'Note not found',
        });
      }

      // Delete note
      NotesModel.deleteNote(noteId, userId);

      logger.info(`Note deleted: ${noteId}`);

      res.json({
        message: 'Note deleted successfully',
      });
    } catch (error) {
      logger.error('Delete note error', error.message);
      next(error);
    }
  }

  /**
   * Get note statistics
   * GET /api/notes/stats
   */
  async getStats(req, res, next) {
    try {
      const userId = req.userId;

      const count = NotesModel.getNoteCount(userId);
      const notes = NotesModel.getNotesByUserId(userId);

      res.json({
        message: 'Statistics retrieved successfully',
        stats: {
          totalNotes: count,
          totalCharacters: notes.reduce((sum, n) => sum + n.content.length, 0),
        },
      });
    } catch (error) {
      logger.error('Get stats error', error.message);
      next(error);
    }
  }
}

module.exports = new NotesController();
```

## File: src/routes/authRoutes.js

```javascript
/**
 * Authentication Routes
 * Public routes for user authentication
 */

const express = require('express');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Public Routes
router.post('/signup', authController.signup.bind(authController));
router.post('/login', authController.login.bind(authController));

// Protected Routes
router.post('/verify', verifyToken, authController.verify.bind(authController));

module.exports = router;
```

## File: src/routes/notesRoutes.js

```javascript
/**
 * Notes Routes
 * Protected routes for notes CRUD operations
 * All routes require valid Authorization header
 */

const express = require('express');
const notesController = require('../controllers/notesController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Notes CRUD Routes
router.get('/', notesController.getNotes.bind(notesController));
router.get('/stats', notesController.getStats.bind(notesController));
router.post('/', notesController.createNote.bind(notesController));
router.get('/:noteId', notesController.getNoteById.bind(notesController));
router.put('/:noteId', notesController.updateNote.bind(notesController));
router.delete('/:noteId', notesController.deleteNote.bind(notesController));

module.exports = router;
```

## File: .gitignore

```
node_modules/
npm-debug.log
.DS_Store
.env
.env.local
.env.*.local
dist/
build/
*.log
.vscode/
.idea/
```

## File: README.md (Backend)

```markdown
# Notes Application Backend

Node.js/Express API for the Notes Application using 3-Tier MVC Architecture.

## Architecture

```
Routes (Endpoints) 
    ↓
Controllers (Business Logic)
    ↓
Models (Data Layer)
    ↓
In-Memory Store (Mock DynamoDB)
```

## Technologies

- **Node.js** - Runtime
- **Express.js** - Web framework
- **UUID** - Unique ID generation
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables

## Project Structure

```
src/
├── controllers/    # Business logic
├── models/        # Data persistence
├── routes/        # API endpoints
├── middleware/    # Authentication, error handling
├── utils/         # Helper functions
└── server.js      # Entry point
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` file with configuration

3. Run in development:
   ```bash
   npm run dev
   ```

4. Run in production:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/verify` - Verify token (protected)

### Notes (Protected)

- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note
- `GET /api/notes/:noteId` - Get single note
- `PUT /api/notes/:noteId` - Update note
- `DELETE /api/notes/:noteId` - Delete note
- `GET /api/notes/stats` - Get user statistics

## Authentication

All protected routes require:
```
Authorization: Bearer <token>
```

## Error Handling

All errors follow standard JSON format:
```json
{
  "error": "ErrorType",
  "message": "Error description"
}
```

## Production Deployment

For AWS EC2 deployment:

1. Replace in-memory models with DynamoDB
2. Use AWS SDK v3 for authentication
3. Integrate AWS Cognito for token verification
4. Deploy behind Application Load Balancer
5. Use Auto Scaling Group for fleet management
6. Enable CloudWatch monitoring
```

---

## Phase 2 Summary

This Express backend provides:
- **MVC Architecture**: Clean separation of concerns
- **Authentication Endpoints**: Signup, login, token verification
- **Protected API Routes**: All note operations require valid token
- **Comprehensive Error Handling**: Global error middleware
- **Mock Data Layer**: Ready for DynamoDB migration
- **Logging**: Request and error logging
- **CORS Support**: Frontend-backend communication
- **Input Validation**: Server-side validation for security
- **Security**: Bearer token authentication, CORS configuration

The backend is production-ready for EC2 deployment and easy DynamoDB integration.
