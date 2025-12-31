# Backend Source Code Files - Copy These Directly

## File: notes-backend/package.json

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

## File: notes-backend/.env.local

```
NODE_ENV=development
PORT=8080
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=7d
```

## File: notes-backend/src/server.js

```javascript
require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');
const notesRoutes = require('./routes/notesRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 8080;

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

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

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

## File: notes-backend/src/utils/logger.js

```javascript
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

## File: notes-backend/src/middleware/authMiddleware.js

```javascript
const logger = require('../utils/logger');

const verifyToken = (req, res, next) => {
  try {
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
    const decodedToken = _decodeAndVerifyToken(token);

    // Attach user info to request
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

function _decodeAndVerifyToken(token) {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));

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

## File: notes-backend/src/middleware/errorHandler.js

```javascript
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled Error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let error = err.error || 'InternalError';

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

  res.status(statusCode).json({
    error,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
```

## File: notes-backend/src/models/AuthModel.js

```javascript
class AuthModel {
  constructor() {
    this.users = [];
  }

  createUser(userData) {
    const user = {
      id: `user-${Date.now()}`,
      email: userData.email,
      password: userData.password,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.push(user);
    return user;
  }

  findUserByEmail(email) {
    return this.users.find((u) => u.email === email) || null;
  }

  findUserById(userId) {
    return this.users.find((u) => u.id === userId) || null;
  }

  userExists(email) {
    return this.users.some((u) => u.email === email);
  }
}

module.exports = new AuthModel();
```

## File: notes-backend/src/models/NotesModel.js

```javascript
const { v4: uuidv4 } = require('uuid');

class NotesModel {
  constructor() {
    this.notes = [];
  }

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

  getNotesByUserId(userId) {
    return this.notes.filter((note) => note.userId === userId);
  }

  getNoteById(noteId, userId) {
    return (
      this.notes.find((note) => note.id === noteId && note.userId === userId) ||
      null
    );
  }

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

  deleteNote(noteId, userId) {
    const initialLength = this.notes.length;

    this.notes = this.notes.filter(
      (note) => !(note.id === noteId && note.userId === userId)
    );

    return this.notes.length < initialLength;
  }

  getNoteCount(userId) {
    return this.notes.filter((note) => note.userId === userId).length;
  }

  clearAll() {
    this.notes = [];
  }
}

module.exports = new NotesModel();
```

## File: notes-backend/src/controllers/authController.js

```javascript
const AuthModel = require('../models/AuthModel');
const logger = require('../utils/logger');

class AuthController {
  async signup(req, res, next) {
    try {
      const { email, password } = req.body;

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

      if (AuthModel.userExists(email)) {
        return res.status(409).json({
          error: 'ConflictError',
          message: 'User with this email already exists',
        });
      }

      const user = AuthModel.createUser({ email, password });
      logger.info(`User created: ${user.id} (${email})`);
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

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Email and password are required',
        });
      }

      const user = AuthModel.findUserByEmail(email);

      if (!user || user.password !== password) {
        return res.status(401).json({
          error: 'AuthenticationError',
          message: 'Invalid email or password',
        });
      }

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

  async verify(req, res, next) {
    try {
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

function _generateToken(userId, email) {
  const payload = {
    userId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  };

  const tokenString = JSON.stringify(payload);
  return Buffer.from(tokenString).toString('base64');
}

module.exports = new AuthController();
```

## File: notes-backend/src/controllers/notesController.js

```javascript
const NotesModel = require('../models/NotesModel');
const logger = require('../utils/logger');

class NotesController {
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

  async createNote(req, res, next) {
    try {
      const { title, content } = req.body;
      const userId = req.userId;

      if (!content || content.trim() === '') {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Note content is required',
        });
      }

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

  async updateNote(req, res, next) {
    try {
      const { noteId } = req.params;
      const { title, content } = req.body;
      const userId = req.userId;

      const note = NotesModel.getNoteById(noteId, userId);

      if (!note) {
        return res.status(404).json({
          error: 'NotFoundError',
          message: 'Note not found',
        });
      }

      if (content !== undefined && (!content || content.trim() === '')) {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Note content cannot be empty',
        });
      }

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

  async deleteNote(req, res, next) {
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

## File: notes-backend/src/routes/authRoutes.js

```javascript
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

## File: notes-backend/src/routes/notesRoutes.js

```javascript
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

## File: notes-backend/.gitignore

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

---

## How to Use These Backend Files

1. Create directory: `mkdir -p notes-backend/src/{controllers,models,routes,middleware,utils}`
2. Copy each file to its path (e.g., package.json goes in notes-backend/)
3. Run: `cd notes-backend && npm install && npm run dev`
4. Backend runs at http://localhost:8080

That's the COMPLETE Express backend! Copy all these files exactly as shown.

**Combined with the frontend files, you now have the complete Notes Application!**
