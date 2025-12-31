# Quick Start Guide - Notes Application

## ⚡ 5-Minute Setup

### Prerequisites
- Node.js v14+ installed
- npm v6+ installed
- Two terminal windows

---

## Step 1: Clone/Download Code (1 min)

Create project directory:
```bash
mkdir notes-application
cd notes-application
mkdir notes-app notes-backend
```

Copy all Phase 1 (React) code files into `notes-app/`
Copy all Phase 2 (Node.js) code files into `notes-backend/`

---

## Step 2: Setup Backend (2 min)

**Terminal 1:**
```bash
cd notes-backend

# Install dependencies
npm install

# Start server
npm run dev
```

Expected output:
```
╔════════════════════════════════════════╗
║   Notes API Server Started            ║
║   Port: 8080                           ║
║   Env: development                     ║
╚════════════════════════════════════════╝
```

✅ Backend running at http://localhost:8080

---

## Step 3: Setup Frontend (2 min)

**Terminal 2:**
```bash
cd notes-app

# Install dependencies
npm install

# Start development server
npm start
```

Expected output:
```
Compiled successfully!

You can now view notes-app in the browser.

  Local:  http://localhost:3000
```

✅ Frontend running at http://localhost:3000

---

## Step 4: Test Application (1 min)

### Sign Up
1. See login page at http://localhost:3000
2. Click "Sign up" link
3. Enter: 
   - Email: `test@example.com`
   - Password: `password123`
4. Click "Sign Up" → Auto-logged in ✅

### Create Note
1. Enter title: `First Note`
2. Enter content: `Hello world!`
3. Click "Create Note"
4. See note appear in list ✅

### Delete Note
1. Click "Delete" button on note
2. Confirm deletion ✅

### Logout
1. Click "Logout" button → Back to login ✅

---

## 🎉 Success!

You now have a fully functional Notes Application running locally!

- ✅ Frontend: React at http://localhost:3000
- ✅ Backend: Express at http://localhost:8080
- ✅ Authentication: Working (mock Cognito)
- ✅ Notes CRUD: All operations functional
- ✅ Data persistence: In-memory during session

---

## Troubleshooting

### Port already in use?
```bash
# Kill process on port 8080
lsof -i :8080
kill -9 <PID>

# Use different port
PORT=8081 npm run dev
```

### Can't connect to backend?
1. Check backend is running: `npm run dev` in notes-backend
2. Check port 8080 is available
3. Check browser console for CORS errors
4. Verify `proxy` in package.json: `"proxy": "http://localhost:8080"`

### Module not found?
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

### 1. Explore the Code
- Read Phase 1 (Frontend) code
- Read Phase 2 (Backend) code
- Understand MVC architecture

### 2. Try Advanced Testing
- Sign up multiple users
- Create 10+ notes
- Check browser DevTools (Network tab)
- Monitor backend logs in terminal

### 3. Deploy to AWS
- Follow Phase 3: AWS EC2 Deployment Guide
- Replace in-memory models with DynamoDB
- Deploy frontend to S3 + CloudFront
- Set up Auto Scaling Group

### 4. Add Features
- Edit notes (currently create + delete only)
- Note categories/tags
- Search functionality
- Real-time updates with WebSockets
- User profile page
- Note sharing

---

## Project Structure Quick Reference

```
notes-application/
│
├── notes-app/                    # React Frontend
│   ├── src/
│   │   ├── api/notesApi.js      # API client
│   │   ├── auth/authService.js  # Auth logic
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── App.jsx              # Root component
│   │   └── App.css              # Styles
│   ├── package.json             # Dependencies
│   └── .env.local               # Config
│
├── notes-backend/                # Express Backend
│   ├── src/
│   │   ├── controllers/         # Business logic
│   │   ├── models/              # Data layer
│   │   ├── routes/              # API endpoints
│   │   ├── middleware/          # Auth, errors
│   │   ├── utils/               # Helpers
│   │   └── server.js            # Entry point
│   ├── package.json             # Dependencies
│   └── .env.local               # Config
│
└── README.md                      # Documentation
```

---

## Key Files to Understand

### Frontend
- **src/App.jsx** - Main routing and layout
- **src/auth/authService.js** - Mock authentication
- **src/api/notesApi.js** - API communication
- **src/pages/NotesPage.jsx** - Main app page

### Backend
- **src/server.js** - Express server setup
- **src/models/NotesModel.js** - Data persistence
- **src/controllers/notesController.js** - Note operations
- **src/middleware/authMiddleware.js** - Token verification
- **src/routes/notesRoutes.js** - API endpoints

---

## Common Commands

```bash
# Backend
cd notes-backend
npm install          # Install dependencies
npm start           # Start production
npm run dev         # Start with auto-reload

# Frontend
cd notes-app
npm install         # Install dependencies
npm start           # Start dev server
npm run build       # Build for production

# Testing
curl http://localhost:8080/health
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123"}'
```

---

## Testing with curl (Optional)

### Create User
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"testuser@example.com",
    "password":"password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"testuser@example.com",
    "password":"password123"
  }'
```

Use returned token for authenticated requests:
```bash
TOKEN="your-token-from-login"

# Create Note
curl -X POST http://localhost:8080/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title":"Test Note",
    "content":"This is a test"
  }'

# Get Notes
curl http://localhost:8080/api/notes \
  -H "Authorization: Bearer $TOKEN"

# Delete Note
curl -X DELETE http://localhost:8080/api/notes/{noteId} \
  -H "Authorization: Bearer $TOKEN"
```

---

## Architecture Overview

### Request Flow
```
User clicks "Create Note"
    ↓
React component calls notesApi.createNote()
    ↓
axios sends POST /api/notes with Bearer token
    ↓
Backend receives request
    ↓
authMiddleware verifies token
    ↓
notesController.createNote() called
    ↓
NotesModel.createNote() stores in memory
    ↓
Returns note object
    ↓
React updates state & re-renders
```

### Data Flow (No Database Persistence)
- User data stored in-memory (lost on restart)
- Notes stored in-memory (lost on restart)
- **This is expected for local development**
- For production: Replace models with DynamoDB

---

## Browser DevTools Tips

### Network Tab
1. Open F12 → Network tab
2. Create a note
3. See POST request to `/api/notes`
4. Check status code, request headers, response body

### Console Tab
1. Check for JavaScript errors
2. Monitor logs from API calls
3. Inspect localStorage: `localStorage`

### Application Tab
1. Go to Storage → Local Storage
2. See `authToken`, `userEmail`, `userId` keys
3. Copy token value to inspect

---

## Performance Tips

### Frontend
- Use DevTools Lighthouse for performance audit
- Check bundle size: `npm run build`
- Monitor component re-renders: Use React DevTools

### Backend
- Monitor response times in logs
- Check `/health` endpoint
- Profile with: `node --prof src/server.js`

---

## Security Notes

⚠️ **This is a DEVELOPMENT implementation:**
- ✅ Passwords are not hashed (mock only)
- ✅ Tokens are base64 encoded, not cryptographically signed
- ✅ No HTTPS enforcement
- ✅ CORS allows localhost only

**For Production:**
- Use bcrypt for password hashing
- Sign tokens with JWT secret
- Enable HTTPS/TLS
- Configure stricter CORS
- Use AWS Cognito for auth
- Enable rate limiting
- Add input sanitization

---

## FAQ

**Q: Can I use this in production?**
A: No. This is a reference implementation. For production, use DynamoDB, AWS Cognito, HTTPS, and proper security measures.

**Q: How do I persist data between server restarts?**
A: Replace in-memory models with DynamoDB integration (see Phase 2 README).

**Q: Can I deploy this now?**
A: Yes, follow Phase 3 AWS EC2 Deployment Guide. Local testing must pass first.

**Q: How do I add more features?**
A: Read the code comments, understand the MVC architecture, then add new routes/controllers/models.

**Q: What if I break something?**
A: All original code is in the Phase 1/2 documentation. Just re-copy the files.

---

## Resources

- **Phase 1 Docs**: notes-app-phase1.md (Full React code)
- **Phase 2 Docs**: notes-app-phase2.md (Full Node.js code)
- **Phase 3 Docs**: notes-app-phase3.md (Setup & AWS deployment)
- **Reference**: implementation-reference.md (Complete API spec)

---

## Support

1. Check documentation files
2. Review error messages in terminal/console
3. Use browser DevTools to debug
4. Check server logs for backend errors
5. Reference example curl commands above

---

**Ready to build something awesome?** 🚀

Start with the Quick Start above, then read the full documentation in Phase 1/2/3 files for detailed explanations of every part of the code.

Happy coding! 💻
