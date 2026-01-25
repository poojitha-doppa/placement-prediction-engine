# Quick Start Guide

## 🚀 Running the Application

### Single Command Setup (Recommended)

Simply run:
```powershell
npm run dev
```

This will automatically start **both** frontend and backend servers:
- **Frontend**: http://localhost:5174/
- **Backend**: http://localhost:3000

### Individual Commands (Optional)

If you want to run them separately:

**Frontend only:**
```powershell
npm run dev:frontend
```

**Backend only:**
```powershell
npm run dev:backend
```

## 📦 First Time Setup

1. **Clone/Navigate to project:**
   ```powershell
   cd "c:\Users\LUCKY\OneDrive\Desktop\project\Placement Prediction"
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   cd backend
   npm install
   cd ..
   ```

3. **Run the application:**
   ```powershell
   npm run dev
   ```

## ✨ What Happens When You Run `npm run dev`

The command uses `concurrently` to run both servers simultaneously:

```
[0] Frontend (Vite) starts on http://localhost:5174/
[1] Backend (Express) starts on http://localhost:3000
```

You'll see output from both servers in the same terminal:
- `[0]` prefix = Frontend logs
- `[1]` prefix = Backend logs

## 🎯 Features Available

✅ User authentication (signup/login)
✅ Profile management
✅ Resume upload with file storage
✅ Dashboard with KPIs and analytics
✅ 16-week personalized roadmap
✅ Company matching and recommendations
✅ Progress tracking
✅ AI-powered insights (requires OpenAI API key)

## 🔧 Configuration

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
```

### Backend (backend/.env)
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/placement_db"
JWT_SECRET="placement-dashboard-secret-key-2025-super-secure"
PORT=3000
CORS_ORIGIN="http://localhost:5174"
OPENAI_API_KEY="sk-your-openai-key-here"
```

## 📊 Database Setup (Optional)

Currently running in **mock mode** (data resets on restart).

To enable persistent storage:

**Option 1: Docker (Easiest)**
```powershell
docker run --name placement-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=placement_db -p 5432:5432 -d postgres:15
```

**Option 2: Local PostgreSQL**
1. Install PostgreSQL
2. Create database "placement_db"
3. Run migrations:
   ```powershell
   cd backend
   npx prisma migrate dev --name init
   ```

## 🛑 Stopping the Application

Press `Ctrl+C` in the terminal to stop both servers.

## 📱 Accessing the Application

Open your browser and navigate to:
- **Frontend UI**: http://localhost:5174/
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 🔑 First Time Usage

1. Go to http://localhost:5174/login
2. Click "Sign Up" to create an account
3. Fill your profile with skills and target companies
4. Upload your resume
5. Explore all features!

## 🐛 Troubleshooting

**Port already in use:**
- The app will automatically find the next available port
- Frontend usually tries 5173, 5174, etc.

**Backend not connecting:**
- Check if port 3000 is available
- Verify backend/.env file exists

**Database warning:**
- Normal if PostgreSQL not installed
- App works perfectly in mock mode for testing

## 📚 Project Structure

```
placement-prediction-dashboard/
├── src/              # Frontend React code
│   ├── pages/        # All page components
│   ├── components/   # Reusable UI components
│   ├── api/          # API client
│   └── contexts/     # React contexts
├── backend/          # Backend Express API
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── agents/       # AI agent layer
│   │   └── middleware/   # Auth, validation
│   └── prisma/       # Database schema
└── package.json      # Root package with dev script
```

## 🎉 You're All Set!

Just run `npm run dev` and start using the application at http://localhost:5174/
