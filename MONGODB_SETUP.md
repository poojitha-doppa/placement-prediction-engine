# MongoDB Database Setup Guide

## Current Configuration Status ✓

Your project is already configured for MongoDB! Here's what you have:

- ✅ Prisma schema configured for MongoDB
- ✅ `.env` file exists with placeholders
- ✅ Database models defined

## Required Information

You need to provide these values in your `.env` file:

### 1. **DATABASE_URL** (MongoDB Connection String)

#### Option A: MongoDB Atlas (Cloud - Recommended)
**Steps:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account (Free Forever M0 cluster)
3. Create a new cluster (takes 3-5 minutes)
4. Click "Connect" → "Connect your application"
5. Copy the connection string, it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/placement_prediction?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your database credentials
7. Update `DATABASE_URL` in `.env` file

**Current value in .env:**
```
DATABASE_URL="mongodb://localhost:27017/placement_prediction"
```

#### Option B: Local MongoDB
**Steps:**
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Install MongoDB on your machine
3. Start MongoDB service:
   ```powershell
   net start MongoDB
   ```
4. Connection string is already set:
   ```
   DATABASE_URL="mongodb://localhost:27017/placement_prediction"
   ```

### 2. **JWT_SECRET** (Already Set ✓)
**Current value:** `placement-dashboard-secret-key-2025-super-secure`

For production, generate a stronger secret:
```powershell
# Generate a random JWT secret
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### 3. **GEMINI_API_KEY** (Optional - For AI Features)
**Steps:**
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key and add to `.env`:
   ```
   GEMINI_API_KEY="your-actual-api-key-here"
   ```

**Note:** Without this, roadmap generation will use mock data (current behavior).

### 4. **ENCRYPTION_KEY** (Already Set ✓)
**Current value:** `0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef`

This is fine for development. For production, generate a new one:
```powershell
# Generate a random 64-character hex string
-join ((0..63) | ForEach-Object { '{0:x}' -f (Get-Random -Maximum 16) })
```

## Database Schema

Your database includes these collections:
- **User** - User accounts and authentication
- **Profile** - Student profiles with skills, CGPA, colleges
- **Roadmap** - Personalized learning roadmaps
- **RoadmapWeek** - Weekly breakdown of roadmap
- **RoadmapTask** - Individual tasks in each week
- **ProgressLog** - Student progress tracking
- **SkillAnalytics** - Skill development metrics
- **CompanyMatch** - Company fit scores and matches
- **OptimizationInsight** - AI-generated recommendations
- **ExternalIntegration** - LeetCode, GitHub, Codeforces connections
- **ExternalMetric** - Metrics from external platforms
- **AgentLog** - AI agent interaction logs

## Post-Setup Commands

Once you provide the MongoDB connection string, run these commands:

```powershell
# Navigate to backend directory
cd backend

# Generate Prisma Client
npm run prisma:generate

# Push schema to MongoDB (creates database and collections)
npx prisma db push

# (Optional) Open Prisma Studio to view your database
npm run prisma:studio
```

## Verification Steps

1. Check if MongoDB is connected:
   - Start the backend server: `npm run dev`
   - Look for connection success message
   - No warning about "mock mode"

2. Test API endpoints:
   - Register a new user: `POST http://localhost:3000/api/auth/register`
   - Login: `POST http://localhost:3000/api/auth/login`

3. View data in Prisma Studio:
   ```powershell
   cd backend
   npm run prisma:studio
   ```
   This opens a GUI at http://localhost:5555

## Current .env File Location

📁 `backend\.env`

```dotenv
DATABASE_URL="mongodb://localhost:27017/placement_prediction"
JWT_SECRET="placement-dashboard-secret-key-2025-super-secure"
JWT_EXPIRES_IN="7d"
GEMINI_API_KEY=""  # Add your Gemini API key here
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
```

## Quick Start Checklist

- [ ] Choose MongoDB Atlas (Cloud) OR Local MongoDB
- [ ] Update `DATABASE_URL` in `backend\.env`
- [ ] (Optional) Get Gemini API key and add to `.env`
- [ ] Run `cd backend; npm run prisma:generate`
- [ ] Run `npx prisma db push` (while in backend directory)
- [ ] Start servers: `npm run dev` (from root directory)
- [ ] Register a test user via the UI at http://localhost:5173

## Need Help?

**MongoDB Atlas Issues:**
- Make sure to whitelist your IP address (0.0.0.0/0 for all IPs during development)
- Check that username/password don't contain special characters that need URL encoding

**Local MongoDB Issues:**
- Verify MongoDB service is running: `Get-Service MongoDB`
- Check MongoDB is listening on port 27017: `Test-NetConnection localhost -Port 27017`

**Prisma Issues:**
- Delete `node_modules/.prisma` and run `npm run prisma:generate` again
- Make sure you're in the backend directory when running Prisma commands
