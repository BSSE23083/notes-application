# Frontend Code Files - Copy These Directly

## File: notes-app/package.json

```json
{
  "name": "notes-app",
  "version": "1.0.0",
  "description": "React Notes Application - Frontend",
  "private": true,
  "proxy": "http://localhost:8080",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": ["react-app"]
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  }
}
```

## File: notes-app/public/index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Notes Application - Secure, Full-Stack" />
    <title>Notes Application</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

## File: notes-app/src/index.js

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## File: notes-app/src/App.jsx

```javascript
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NotesPage from './pages/NotesPage';
import ProtectedRoute from './components/ProtectedRoute';
import { authService } from './auth/authService';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/signup" element={<SignupPage onSignupSuccess={handleLoginSuccess} />} />
        <Route
          path="/notes"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <NotesPage onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/notes" /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
```

## File: notes-app/src/App.css

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #333;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.auth-form {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.auth-form h2 {
  margin-bottom: 30px;
  color: #333;
  text-align: center;
  font-size: 28px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.btn {
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  margin-top: 10px;
}

.btn:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

.btn:active {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  width: auto;
  margin-top: 0;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-danger {
  background: #dc3545;
  padding: 8px 16px;
  width: auto;
  font-size: 14px;
}

.btn-danger:hover {
  background: #c82333;
}

.auth-link {
  text-align: center;
  margin-top: 20px;
}

.auth-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.auth-link a:hover {
  text-decoration: underline;
}

.notes-page {
  padding: 30px 0;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  background: white;
  padding: 20px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.notes-header h1 {
  color: #333;
  font-size: 32px;
}

.notes-header p {
  color: #666;
  margin-top: 8px;
}

.notes-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
}

@media (max-width: 768px) {
  .notes-content {
    grid-template-columns: 1fr;
  }
}

.note-form-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  height: fit-content;
  position: sticky;
  top: 20px;
}

.note-form-section h2 {
  margin-bottom: 20px;
  color: #333;
  font-size: 20px;
}

.notes-list-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.notes-list-section h2 {
  margin-bottom: 20px;
  color: #333;
  font-size: 20px;
}

.notes-grid {
  display: grid;
  gap: 16px;
}

.note-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.note-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.note-content {
  flex: 1;
  word-break: break-word;
  line-height: 1.6;
  color: #555;
}

.note-content h3 {
  margin-bottom: 8px;
  color: #333;
}

.note-content p {
  margin: 0;
}

.note-meta {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.note-actions {
  display: flex;
  gap: 8px;
  margin-left: 16px;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  border-left: 4px solid #dc3545;
}

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  border-left: 4px solid #28a745;
}

.loader {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-size: 18px;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-state p {
  font-size: 16px;
}
```

## File: notes-app/src/auth/authService.js

```javascript
const MOCK_USERS = [];

class AuthService {
  async signup(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    const userExists = MOCK_USERS.find((u) => u.email === email);
    if (userExists) {
      throw new Error('User already exists');
    }
    const mockUser = {
      id: `user-${Date.now()}`,
      email,
      password,
      createdAt: new Date().toISOString(),
    };
    MOCK_USERS.push(mockUser);
    const token = this._generateMockToken(mockUser.id, email);
    return {
      userId: mockUser.id,
      email: mockUser.email,
      token,
    };
  }

  async login(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    const user = MOCK_USERS.find((u) => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    const token = this._generateMockToken(user.id, email);
    localStorage.setItem('authToken', token);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userId', user.id);
    return {
      userId: user.id,
      email: user.email,
      token,
    };
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
  }

  getToken() {
    return localStorage.getItem('authToken');
  }

  getUserEmail() {
    return localStorage.getItem('userEmail');
  }

  getUserId() {
    return localStorage.getItem('userId');
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  _generateMockToken(userId, email) {
    const payload = {
      userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 7,
    };
    const tokenString = JSON.stringify(payload);
    return btoa(tokenString);
  }
}

export const authService = new AuthService();
```

## File: notes-app/src/api/notesApi.js

```javascript
import axios from 'axios';
import { authService } from '../auth/authService';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class NotesApi {
  async fetchNotes() {
    try {
      const response = await apiClient.get('/notes');
      return response.data.notes || [];
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  }

  async createNote(noteData) {
    try {
      const response = await apiClient.post('/notes', {
        title: noteData.title || 'Untitled',
        content: noteData.content,
      });
      return response.data.note;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  async deleteNote(noteId) {
    try {
      const response = await apiClient.delete(`/notes/${noteId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }

  async updateNote(noteId, noteData) {
    try {
      const response = await apiClient.put(`/notes/${noteId}`, {
        title: noteData.title || 'Untitled',
        content: noteData.content,
      });
      return response.data.note;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }
}

export const notesApi = new NotesApi();
```

## File: notes-app/src/components/ProtectedRoute.jsx

```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
```

## File: notes-app/src/components/NoteForm.jsx

```javascript
import React, { useState } from 'react';
import { notesApi } from '../api/notesApi';

function NoteForm({ onNoteCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Note content cannot be empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newNote = await notesApi.createNote({
        title: title || 'Untitled',
        content,
      });
      setTitle('');
      setContent('');
      onNoteCreated(newNote);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>New Note</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title (Optional)</label>
          <input
            id="title"
            type="text"
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            placeholder="Write your note here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Creating...' : 'Create Note'}
        </button>
      </form>
    </div>
  );
}

export default NoteForm;
```

## File: notes-app/src/components/NoteCard.jsx

```javascript
import React, { useState } from 'react';
import { notesApi } from '../api/notesApi';

function NoteCard({ note, onNoteDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      await notesApi.deleteNote(note.id);
      onNoteDeleted(note.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete note');
      setDeleting(false);
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const createdDate = new Date(note.createdAt).toLocaleDateString();

  return (
    <div className="note-card">
      <div className="note-content">
        {note.title && <h3>{note.title}</h3>}
        <p>{note.content}</p>
        <div className="note-meta">Created: {createdDate}</div>
      </div>
      <div className="note-actions">
        <button
          className="btn btn-danger"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

export default NoteCard;
```

## File: notes-app/src/pages/LoginPage.jsx

```javascript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../auth/authService';

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.login(email, password);
      onLoginSuccess();
      navigate('/notes');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
```

## File: notes-app/src/pages/SignupPage.jsx

```javascript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../auth/authService';

function SignupPage({ onSignupSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await authService.signup(email, password);
      await authService.login(email, password);
      onSignupSuccess();
      navigate('/notes');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Sign Up</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
```

## File: notes-app/src/pages/NotesPage.jsx

```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NoteForm from '../components/NoteForm';
import NoteCard from '../components/NoteCard';
import { notesApi } from '../api/notesApi';
import { authService } from '../auth/authService';

function NotesPage({ onLogout }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setLoading(true);
    setError('');

    try {
      const fetchedNotes = await notesApi.fetchNotes();
      setNotes(fetchedNotes);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleNoteCreated = (newNote) => {
    setNotes([newNote, ...notes]);
  };

  const handleNoteDeleted = (noteId) => {
    setNotes(notes.filter((note) => note.id !== noteId));
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const userEmail = authService.getUserEmail();

  return (
    <div className="notes-page">
      <div className="container">
        <div className="notes-header">
          <div>
            <h1>My Notes</h1>
            <p>Logged in as: {userEmail}</p>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="notes-content">
          <div className="note-form-section">
            <NoteForm onNoteCreated={handleNoteCreated} />
          </div>

          <div className="notes-list-section">
            <h2>Your Notes ({notes.length})</h2>
            {loading ? (
              <div className="loader" style={{ minHeight: '200px' }}>
                Loading notes...
              </div>
            ) : notes.length === 0 ? (
              <div className="empty-state">
                <p>No notes yet. Create your first note!</p>
              </div>
            ) : (
              <div className="notes-grid">
                {notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onNoteDeleted={handleNoteDeleted}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotesPage;
```

## File: notes-app/.env.local

```
REACT_APP_API_URL=http://localhost:8080/api
```

## File: notes-app/.gitignore

```
node_modules/
build/
dist/
.env.local
.env.*.local
npm-debug.log*
yarn-debug.log*
.DS_Store
.idea/
.vscode/
*.swp
*.swo
```

---

## How to Use These Frontend Files

1. Create directory: `mkdir -p notes-app/src/{api,auth,components,pages}`
2. Create directory: `mkdir notes-app/public`
3. Copy each file to its path (e.g., package.json goes in notes-app/)
4. Run: `cd notes-app && npm install && npm start`
5. Frontend runs at http://localhost:3000

That's the COMPLETE React frontend! Copy all these files exactly as shown.
