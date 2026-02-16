# 🚀 Setup Guide

Complete step-by-step guide to set up and run the Music Recommendation System.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Python 3.10+ installed
- [ ] PostgreSQL 12+ installed and running
- [ ] Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- [ ] Git installed

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/music-app.git
cd music-app
```

## Step 2: Database Setup

### 2.1 Install PostgreSQL

**Windows:**
- Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- Install and remember your postgres user password

**Linux:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

### 2.2 Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE music_app_db;

# Exit psql
\q
```

## Step 3: Environment Configuration

### 3.1 Backend Environment Variables

Create `backend/.env`:

```bash
cd backend
cp .env.example .env  # If .env.example exists
# Or create .env manually
```

Edit `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/music_app_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
PORT=4000
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your-google-client-id-optional
GOOGLE_API_KEY=your-google-api-key
```

### 3.2 AI Service Environment Variables

Create `scripts/.env` (or use backend/.env):

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/music_app_db
GOOGLE_API_KEY=your-google-api-key
EMBEDDING_MODEL=text-embedding-004  # Optional
```

## Step 4: Install Dependencies

### 4.1 Core Backend (Express)

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
```

### 4.2 Secondary Backend (NestJS)

```bash
cd backend-nest
npm install
```

### 4.3 AI Service (FastAPI)

```bash
# From project root
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install Python dependencies
pip install fastapi uvicorn asyncpg chromadb langchain-google-genai google-genai python-dotenv requests
```

### 4.4 Frontend

```bash
cd frontend/frontend
npm install
```

## Step 5: Seed the Database

```bash
# From project root
# Make sure virtual environment is activated
python scripts/seed_songs.py

# This will fetch songs from Deezer API and populate the database
# It may take several minutes to complete
```

## Step 6: Start the Services

### Terminal 1: Core Backend
```bash
cd backend
npm run dev
```
Wait for: `Server running on http://0.0.0.0:4000`

### Terminal 2: Secondary Backend (Optional)
```bash
cd backend-nest
npm run start:dev
```
Wait for: `Server running on http://0.0.0.0:4001`

### Terminal 3: AI Service
```bash
# From project root
cd scripts
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or use batch file (Windows)
.\start_backend.bat
```
Wait for: `Uvicorn running on http://0.0.0.0:8000`

### Terminal 4: Frontend
```bash
cd frontend/frontend
npm run dev
```
Wait for: `Local: http://localhost:5173`

## Step 7: Verify Installation

1. Open browser: http://localhost:5173
2. You should see the music app interface
3. Check browser console for any errors
4. Try searching for songs
5. Test genre filters

## Troubleshooting

### Database Connection Issues

**Error: "Database connection failed"**
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in .env matches your PostgreSQL setup
- Check username/password are correct

### Port Already in Use

**Error: "Address already in use"**
- Check what's using the port: `netstat -ano | findstr :8000` (Windows)
- Kill the process or change the port in configuration

### Vector Store Issues

**Error: "Collection expecting embedding with dimension..."**
- Delete the old vector store: `rm -rf music_db` (Linux/Mac) or `Remove-Item -Recurse -Force music_db` (Windows)
- Re-run seed script

### API Key Issues

**Error: "GOOGLE_API_KEY is missing"**
- Verify .env file exists and contains GOOGLE_API_KEY
- Check .env file is in the correct directory
- Restart the service after adding API key

### No Songs Showing

- Run seed script: `python scripts/seed_songs.py`
- Check database has songs: `psql -U postgres -d music_app_db -c "SELECT COUNT(*) FROM songs;"`
- Verify backend is running on port 8000
- Check browser console for API errors

## Next Steps

- Read [README.md](./README.md) for feature overview
- Check [API Documentation](./API.md) for endpoint details
- Review [CONTRIBUTING.md](./CONTRIBUTING.md) to contribute

## Getting Help

- Open an issue on GitHub
- Check existing issues for solutions
- Review the code comments for implementation details
