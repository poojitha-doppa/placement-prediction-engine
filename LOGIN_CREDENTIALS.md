# 🔐 Login Credentials

## Default Test User

Since the database is running in **mock mode** (no PostgreSQL connected), a default test user has been automatically created:

```
Email: poojithadoppa8@gmail.com
Password: Poojitha@2006
```

## How to Login

1. **Open the application** at: http://localhost:5174/
2. **Enter the credentials** above
3. **Click "Login"**

## If Login Still Fails

### Check Backend Server
The backend must be running on port 3000. You should see this message in the terminal:
```
✅ Default test user created: poojithadoppa8@gmail.com / Poojitha@2006
🚀 Backend server running on http://localhost:3000
```

### Check Frontend
The frontend should be running on port 5173 or 5174

### Common Issues

1. **"Invalid email or password"** - Make sure you're using the exact credentials above
2. **"Failed to load analytics data"** - This means you're logged in but the analytics API is having issues. Refresh the page.
3. **Network errors** - Make sure both frontend and backend servers are running

## Creating New Users

You can also sign up with a new account by:
1. Click the **"Sign Up"** tab
2. Enter your name, email, and password
3. Click **"Sign Up"**

**Note:** All user data is stored in memory and will be lost when the server restarts.

## Need Database Persistence?

To enable permanent storage:
1. Install PostgreSQL
2. Create a `.env` file in the `backend` folder
3. Add: `DATABASE_URL="postgresql://user:password@localhost:5432/placement_db"`
4. Run: `cd backend && npx prisma db push`
