# Notes Application - Phase 3: Local Setup & Testing Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Initialization](#project-initialization)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [Testing Workflow](#testing-workflow)
7. [Troubleshooting](#troubleshooting)
8. [AWS EC2 Deployment Guide](#aws-ec2-deployment-guide)

---

## Prerequisites

### Required Software

Ensure you have the following installed on your system:

#### Node.js & npm
- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher

**Installation:**
- macOS: `brew install node`
- Windows: Download from https://nodejs.org/
- Linux: `sudo apt-get install nodejs npm`

**Verify Installation:**
```bash
node --version
npm --version
```

#### Git (Optional but Recommended)
```bash
git --version
```

#### Code Editor
- VS Code (recommended)
- WebStorm
- Sublime Text
- Any text editor

---

## Project Initialization

### Create Project Directory

```bash
# Create root directory
mkdir notes-application
cd notes-application

# Create subdirectories
mkdir notes-app
mkdir notes-backend
```

### Directory Structure

```
notes-application/
├── notes-app/          (Frontend - React)
├── notes-backend/      (Backend - Express)
└── README.md
```

---

## Backend Setup

### Step 1: Initialize Backend Project

```bash
cd notes-backend
npm init -y
```

### Step 2: Install Dependencies

```bash
npm install express cors dotenv uuid
npm install --save-dev nodemon
```

**Dependencies Explained:**
- `express` - Web framework
- `cors` - Cross-origin request handling
- `dotenv` - Environment variable management
- `uuid` - Unique ID generation
- `nodemon` - Auto-restart on file changes (dev only)

### Step 3: Create Project Structure

```bash
# Create directories
mkdir -p src/controllers src/models src/routes src/middleware src/utils

# Create files (use your editor or these commands)
touch src/server.js
touch src/utils/logger.js
touch src/middleware/authMiddleware.js
touch src/middleware/errorHandler.js
touch src/models/AuthModel.js
touch src/models/NotesModel.js
touch src/controllers/authController.js
touch src/controllers/notesController.js
touch src/routes/authRoutes.js
touch src/routes/notesRoutes.js
touch .env.local
touch .gitignore
touch README.md
```

### Step 4: Copy Code Files

Copy all backend code from Phase 2 into respective files:

1. **src/server.js** - Main entry point
2. **src/utils/logger.js** - Logging utility
3. **src/middleware/authMiddleware.js** - Auth middleware
4. **src/middleware/errorHandler.js** - Error handler
5. **src/models/AuthModel.js** - User data model
6. **src/models/NotesModel.js** - Notes data model
7. **src/controllers/authController.js** - Auth logic
8. **src/controllers/notesController.js** - Notes logic
9. **src/routes/authRoutes.js** - Auth endpoints
10. **src/routes/notesRoutes.js** - Notes endpoints
11. **.env.local** - Environment configuration
12. **package.json** - Dependencies and scripts

### Step 5: Verify Backend Setup

```bash
# Test backend startup
npm start
```

Expected output:
```
╔════════════════════════════════════════╗
║   Notes API Server Started            ║
║   Port: 8080                           ║
║   Env: development                     ║
╚════════════════════════════════════════╝
```

**Stop the server** with `Ctrl+C`

---

## Frontend Setup

### Step 1: Create React App

```bash
cd ../notes-app
npx create-react-app . --template cra-template
```

Or use Vite for faster development:
```bash
cd ../notes-app
npm create vite@latest . -- --template react
npm install
```

### Step 2: Install Dependencies

```bash
npm install react-router-dom axios
```

**Dependencies Explained:**
- `react-router-dom` - Client-side routing
- `axios` - HTTP client with request/response interceptors

### Step 3: Create Project Structure

```bash
# Create directories
mkdir -p src/api src/auth src/components src/pages

# Create files
touch src/api/notesApi.js
touch src/auth/authService.js
touch src/components/ProtectedRoute.jsx
touch src/components/NoteForm.jsx
touch src/components/NoteCard.jsx
touch src/pages/LoginPage.jsx
touch src/pages/SignupPage.jsx
touch src/pages/NotesPage.jsx
touch src/App.jsx
touch src/App.css
touch .env.local
touch .gitignore
```

### Step 4: Update package.json

Add proxy setting and update scripts:

```json
{
  "proxy": "http://localhost:8080",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

### Step 5: Copy Code Files

Copy all frontend code from Phase 1 into respective files:

1. **src/App.jsx** - Root component with routing
2. **src/App.css** - Application styles
3. **src/index.js** - React entry point
4. **src/auth/authService.js** - Auth logic
5. **src/api/notesApi.js** - API service
6. **src/components/ProtectedRoute.jsx** - Route protection
7. **src/components/NoteForm.jsx** - Create note form
8. **src/components/NoteCard.jsx** - Note display
9. **src/pages/LoginPage.jsx** - Login form
10. **src/pages/SignupPage.jsx** - Signup form
11. **src/pages/NotesPage.jsx** - Main notes page
12. **public/index.html** - HTML template
13. **.env.local** - Environment variables

### Step 6: Verify Frontend Setup

```bash
# Test frontend build
npm run build
```

Expected: Build completes without errors in `build/` directory

---

## Running the Application

### Terminal 1: Start Backend Server

```bash
cd notes-backend
npm start

# Or for development with auto-reload:
npm run dev
```

Expected output:
```
[2024-12-14T20:45:30.123Z] [INFO] 
╔════════════════════════════════════════╗
║   Notes API Server Started            ║
║   Port: 8080                           ║
║   Env: development                     ║
╚════════════════════════════════════════╝
```

### Terminal 2: Start Frontend Development Server

```bash
cd notes-app
npm start
```

Expected output:
```
webpack compiled successfully
Compiled successfully!

You can now view notes-app in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
```

**Automatic browser opening:** Your default browser should open http://localhost:3000

---

## Testing Workflow

### Complete End-to-End Test Flow

Follow these steps to test all application features:

#### 1. **Sign Up (Registration)**

1. Browser shows Login page
2. Click "Sign up" link (or navigate to `/signup`)
3. **Enter User Details:**
   - Email: `testuser@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
4. Click "Sign Up" button
5. **Expected Result:** 
   - Auto-redirected to Notes page
   - User logged in (email shown in header)

**Behind the scenes:**
```
Frontend (React)
  ↓ POST /api/auth/signup
Backend (Express)
  ↓
AuthModel.createUser()
  ↓ In-memory user storage
Returns: { userId, token }
  ↓
Frontend localStorage.setItem('authToken', token)
```

#### 2. **Create Notes**

1. On Notes page, see form on left side
2. **Create First Note:**
   - Title: `My First Note` (optional)
   - Content: `This is my first note created in the Notes Application!`
   - Click "Create Note" button
3. **Expected Result:**
   - Note appears in list on right side
   - Form clears
   - Note count increases

4. **Create Multiple Notes** (test list):
   - Note 2: Title: `Shopping List`, Content: `Milk, eggs, bread`
   - Note 3: Title: `Meeting Notes`, Content: `Discuss Q4 planning`
   - Note 4: (Optional title), Content: `Random thoughts...`
5. **Expected Result:** All 4+ notes visible in grid

**Behind the scenes:**
```
Frontend (React)
  ↓ POST /api/notes with Bearer token
Backend (Express)
  ↓ verifyToken middleware
  ↓ notesController.createNote()
  ↓
NotesModel.createNote() 
  ↓ In-memory notes array
Returns: { id, title, content, createdAt }
  ↓
Frontend updates state & re-renders list
```

#### 3. **View Notes**

1. All created notes display in a grid
2. Each note shows:
   - Title (if provided)
   - Content text
   - Created date
   - Delete button

3. **Test Scrolling & Layout:**
   - Notes wrap properly
   - Form stays sticky on left (responsive)
   - Mobile view: form above notes

#### 4. **Delete Notes**

1. Click "Delete" button on any note
2. Confirmation dialog appears: "Are you sure?"
3. Click "OK" to confirm deletion
4. **Expected Result:**
   - Note removed from list
   - Note count decreases
   - Other notes remain intact

5. **Test deletion error recovery:**
   - Delete a note
   - Verify notes list refreshes correctly

#### 5. **Logout**

1. Click "Logout" button (top right)
2. **Expected Result:**
   - Redirected to Login page
   - Session cleared
   - Token removed from localStorage

**Behind the scenes:**
```
Frontend (React)
  ↓ authService.logout()
  ↓ localStorage.removeItem('authToken')
  ↓ Navigate to /login
```

#### 6. **Login with Existing User**

1. On Login page, enter credentials:
   - Email: `testuser@example.com`
   - Password: `password123`
2. Click "Login" button
3. **Expected Result:**
   - Redirected to Notes page
   - All previously created notes visible
   - User email shown in header

#### 7. **Test Error Handling**

**Invalid Login:**
- Email: `wrong@example.com`
- Password: `wrongpassword`
- Expected: Error message "Invalid email or password"

**Empty Note Content:**
- Try creating note with empty content
- Expected: Error "Note content cannot be empty"

**Authentication Failure:**
- Open browser DevTools
- Modify localStorage token to invalid value
- Refresh page
- Try to access notes
- Expected: Redirected to login with 401 error

---

## Testing Checklist

Use this checklist to verify all functionality:

```
[ ] Frontend loads at http://localhost:3000
[ ] Backend running at http://localhost:8080
[ ] Sign up creates new user
[ ] Login with correct credentials succeeds
[ ] Login with wrong credentials fails with error
[ ] Create note successfully
[ ] Create multiple notes
[ ] Notes display in list
[ ] Delete note with confirmation
[ ] Logout removes session
[ ] Login shows previously created notes
[ ] Protected routes redirect to login if not authenticated
[ ] Forms validate input
[ ] API returns proper error messages
[ ] Request/response timing reasonable (<2s)
[ ] No console errors in browser DevTools
[ ] No server errors in terminal
```

---

## Browser Developer Tools

### Verify Network Communication

1. Open Chrome DevTools: **F12** or **Cmd+Option+I**
2. Go to **Network** tab
3. Perform actions (signup, login, create note)
4. **Observe requests:**
   - `POST /api/auth/signup` - Status 201
   - `POST /api/auth/login` - Status 200
   - `POST /api/notes` - Status 201
   - `GET /api/notes` - Status 200
   - `DELETE /api/notes/{id}` - Status 200

### Check Authentication Headers

1. In Network tab, click on any `/api/notes` request
2. Go to **Headers** tab
3. Scroll to **Request Headers**
4. Verify: `Authorization: Bearer <token>`

### Monitor Local Storage

1. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
2. Click **Local Storage**
3. Click `http://localhost:3000`
4. Verify keys:
   - `authToken` - Contains encoded token
   - `userEmail` - Contains user email
   - `userId` - Contains user ID

### Check Console for Errors

1. Go to **Console** tab
2. Perform actions
3. Should see no **red errors** (warnings OK)
4. See debug logs from API calls

---

## Troubleshooting

### Backend Won't Start

**Error:** `Port 8080 already in use`

Solution:
```bash
# Find process using port 8080
lsof -i :8080

# Kill process
kill -9 <PID>

# Or use different port
PORT=8081 npm start
```

**Error:** `Cannot find module 'express'`

Solution:
```bash
npm install
```

### Frontend Won't Connect to Backend

**Error:** `GET http://localhost:8080/api/notes net::ERR_CONNECTION_REFUSED`

**Troubleshooting:**
1. Verify backend is running on port 8080
2. Check CORS origin in `.env.local`
3. Check proxy in `package.json`: `"proxy": "http://localhost:8080"`
4. Clear browser cache and reload
5. Check firewall isn't blocking port 8080

### CORS Errors

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Verify backend CORS config:
   ```javascript
   cors({
     origin: 'http://localhost:3000',
     credentials: true,
   })
   ```
2. Verify frontend requests include credentials:
   ```javascript
   axios.defaults.withCredentials = true;
   ```
3. Restart backend server

### Token Errors

**Error:** `Invalid or expired token`

**Solution:**
1. Clear localStorage: `localStorage.clear()`
2. Sign up again to get new token
3. Check token format in DevTools

### Notes Not Persisting

**Note:** Current implementation uses in-memory storage

**Current Behavior:**
- Notes persist during active session
- Notes lost when backend restarts
- Each frontend refresh is OK (backend running)

**This is expected in Phase 1-3 (local testing)**

**For Production:**
- Replace `NotesModel.js` with DynamoDB integration
- See AWS EC2 Deployment Guide below

---

## Performance Testing

### Simulate Multiple Users

**Terminal 3:**
```bash
# Test with curl
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@example.com","password":"password123"}'

# Response:
# {
#   "message": "User created successfully",
#   "user": {"id": "user-...", "email": "user2@example.com"},
#   "token": "eyJ1c2VyS2..."
# }
```

**Create Notes for User 2:**
```bash
TOKEN="<token_from_above>"

curl -X POST http://localhost:8080/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"User 2 Note","content":"This is user 2 note"}'
```

**Get All Notes:**
```bash
curl http://localhost:8080/api/notes \
  -H "Authorization: Bearer $TOKEN"
```

---

## AWS EC2 Deployment Guide

### Phase 4: Prepare for AWS Deployment

This section describes how to deploy to AWS EC2.

#### Prerequisites for AWS

1. AWS Account with:
   - EC2 access
   - Application Load Balancer (ALB) access
   - Auto Scaling Group (ASG) access
   - DynamoDB access
   - CloudWatch access

2. AWS CLI configured:
   ```bash
   aws configure
   ```

3. SSH key pair created in EC2

#### Step 1: Prepare Backend for Production

**Update models/NotesModel.js to use DynamoDB:**

```javascript
// Replace in-memory array with AWS SDK v3
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { 
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

class NotesModel {
  async createNote(userId, noteData) {
    const note = {
      id: uuidv4(),
      userId,
      title: noteData.title || 'Untitled',
      content: noteData.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: "Notes",
        Item: note,
      })
    );

    return note;
  }

  async getNotesByUserId(userId) {
    const result = await docClient.send(
      new QueryCommand({
        TableName: "Notes",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
    );
    return result.Items || [];
  }
  // ... implement other methods similarly
}
```

**Update middleware/authMiddleware.js to use Cognito:**

```javascript
const aws = require('aws-sdk');
const cognitoIdentityServiceProvider = new aws.CognitoIdentityServiceProvider();

async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }

  try {
    const decoded = await cognitoIdentityServiceProvider
      .getUser({
        AccessToken: token,
      })
      .promise();

    req.userId = decoded.Username;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

#### Step 2: Create EC2 Instance

```bash
# Launch EC2 instance
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t2.small \
  --key-name your-key-pair \
  --security-groups notes-app-sg \
  --user-data file://user-data.sh
```

**user-data.sh:**
```bash
#!/bin/bash
sudo yum update -y
sudo yum install -y nodejs npm

# Clone repository
git clone https://your-repo-url.git /opt/notes-app
cd /opt/notes-app/notes-backend

# Install dependencies
npm install --production

# Create service
sudo tee /etc/systemd/system/notes-api.service > /dev/null <<EOF
[Unit]
Description=Notes API Server
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/notes-app/notes-backend
ExecStart=/usr/bin/node src/server.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable notes-api
sudo systemctl start notes-api
```

#### Step 3: Create Application Load Balancer

```bash
# Create target group
aws elbv2 create-target-group \
  --name notes-api-tg \
  --protocol HTTP \
  --port 8080 \
  --vpc-id vpc-xxxxx

# Create ALB
aws elbv2 create-load-balancer \
  --name notes-api-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:...
```

#### Step 4: Create Auto Scaling Group

```bash
# Create launch template
aws ec2 create-launch-template \
  --launch-template-name notes-api-lt \
  --launch-template-data file://launch-template.json

# Create ASG
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name notes-api-asg \
  --launch-template LaunchTemplateName=notes-api-lt \
  --min-size 2 \
  --max-size 4 \
  --desired-capacity 2 \
  --target-group-arns arn:aws:elasticloadbalancing:...
```

#### Step 5: Deploy Frontend to S3 + CloudFront

```bash
# Build frontend
cd notes-app
npm run build

# Create S3 bucket
aws s3 mb s3://notes-app-frontend

# Upload build files
aws s3 sync build/ s3://notes-app-frontend/

# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name notes-app-frontend.s3.amazonaws.com \
  --enabled
```

#### Step 6: Monitor with CloudWatch

```bash
# Create custom metric
aws cloudwatch put-metric-alarm \
  --alarm-name notes-api-errors \
  --alarm-description "Alert on API errors" \
  --metric-name ErrorCount \
  --namespace Notes \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

---

## Summary

You now have:

1. ✅ **Local Development Environment** - Frontend & backend running
2. ✅ **Complete Test Suite** - Verify all functionality
3. ✅ **Deployment Guide** - Ready for AWS EC2
4. ✅ **Production Readiness** - DynamoDB, Cognito, CloudWatch integration

### Next Steps

1. **Local Testing**: Follow Testing Workflow section
2. **Fix Issues**: Use Troubleshooting section
3. **AWS Deployment**: Follow AWS EC2 Deployment Guide
4. **Production**: Add monitoring, logging, and auto-scaling

---

## Support & Resources

### Documentation Links

- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [AWS SDK for Node.js](https://docs.aws.amazon.com/sdk-for-javascript/latest/developer-guide/)
- [AWS EC2 User Guide](https://docs.aws.amazon.com/ec2/)

### Common Commands Reference

```bash
# Backend
cd notes-backend
npm install              # Install dependencies
npm start               # Start production server
npm run dev            # Start with auto-reload

# Frontend
cd notes-app
npm install             # Install dependencies
npm start              # Start dev server
npm run build          # Build for production

# Testing
curl -X GET http://localhost:8080/health
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Monitoring Health

**Backend Health Check:**
```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-14T20:45:30.123Z"
}
```

---

**You're ready to build, test, and deploy! 🚀**
