# Backend Setup Guide

## Prerequisites
You need PostgreSQL installed. Choose one option:

### Option 1: Docker (Recommended)
```powershell
docker run --name placement-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=placement_db -p 5432:5432 -d postgres:15
```

### Option 2: Local PostgreSQL
Download and install from: https://www.postgresql.org/download/windows/

## Setup Steps

1. **Update .env with your database credentials**
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/placement_db"
   ```

2. **Run migrations**
   ```powershell
   cd backend
   npx prisma migrate dev --name init
   ```

3. **Start the server**
   ```powershell
   npm run dev
   ```

## Using Mock Database (Without PostgreSQL)

If you don't have PostgreSQL, the backend will run with mock data in memory.
The endpoints will work but data won't persist between restarts.

Just run:
```powershell
npm run dev
```
