# 🎵 AI-Powered Music Recommendation System

A full-stack music application featuring AI-powered recommendations, real-time music streaming, and a modern React frontend. Built with FastAPI, React, PostgreSQL, ChromaDB, and Google Gemini AI.

![Tech Stack](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## ✨ Features

- 🎯 **AI-Powered Recommendations** - Personalized song suggestions using Google Gemini embeddings and vector similarity search
- 🎵 **Real Music Data** - Integrated with Deezer API for real music tracks across 12+ genres
- 🔍 **Smart Search** - Search songs by title, artist, album, or genre
- 📊 **Trending Music** - Discover popular songs based on play counts
- 🎧 **Listen History** - Track your listening history for better recommendations
- 🎨 **Modern UI** - Beautiful, responsive interface built with React and Tailwind CSS
- 🔐 **User Authentication** - Secure login with JWT and Google OAuth support
- 📱 **Multi-Service Architecture** - Scalable microservices architecture

## 🏗️ Architecture

```
┌─────────────┐
│   Frontend   │  React + Vite (Port 5173)
│   (React)    │
└──────┬───────┘
       │
       ├─────────────────┬──────────────────┐
       │                 │                  │
┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
│ Core Backend │  │Secondary API │  │  AI Service  │
│  (Express)   │  │   (NestJS)   │  │  (FastAPI)   │
│  Port 4000   │  │  Port 4001   │  │  Port 8000   │
└──────┬───────┘  └─────────────┘  └──────┬───────┘
       │                                    │
       │                                    │
┌──────▼───────────────────────────────────▼──────┐
│           PostgreSQL Database                   │
│  (Users, Songs, Playlists, Listen History)      │
└────────────────────────────────────────────────┘
       │
       │
┌──────▼──────┐
│  ChromaDB    │
│ Vector Store │
│ (Embeddings) │
└─────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **PostgreSQL** 12+
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/music-app.git
   cd music-app
   ```

2. **Set up the database**
   ```bash
   # Start PostgreSQL service
   # Create database
   createdb music_app_db
   ```

3. **Configure environment variables**

   Create `.env` files in the following locations:
   
   **`backend/.env`**:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/music_app_db
   JWT_SECRET=your-secret-key-change-in-production
   NODE_ENV=development
   PORT=4000
   JWT_EXPIRES_IN=7d
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_API_KEY=your-google-api-key
   ```
   
   **`scripts/.env`** (optional, can use backend/.env):
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/music_app_db
   GOOGLE_API_KEY=your-google-api-key
   ```

4. **Install dependencies**

   **Backend (Core - Express)**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate dev
   ```

   **Backend (Secondary - NestJS)**
   ```bash
   cd backend-nest
   npm install
   ```

   **AI Service (FastAPI)**
   ```bash
   # Create virtual environment (recommended)
   python -m venv venv
   
   # Activate virtual environment
   # Windows:
   venv\Scripts\activate
   # Linux/Mac:
   source venv/bin/activate
   
   # Install dependencies
   pip install fastapi uvicorn asyncpg chromadb langchain-google-genai google-genai python-dotenv requests
   ```

   **Frontend**
   ```bash
   cd frontend/frontend
   npm install
   ```

5. **Seed the database with songs**
   ```bash
   # From project root
   python scripts/seed_songs.py
   
   # Or seed specific genres
   python scripts/seed_songs.py rock
   python scripts/seed_songs.py pop
   ```

## 🎮 Running the Application

You need **three terminal windows** for the full application:

### Terminal 1: Core Backend (Express)
```bash
cd backend
npm run dev
# Server runs on http://localhost:4000
```

### Terminal 2: Secondary Backend (NestJS) - Optional
```bash
cd backend-nest
npm run start:dev
# Server runs on http://localhost:4001
```

### Terminal 3: AI Service (FastAPI)
```bash
# From project root
cd scripts
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or use the batch file (Windows)
.\start_backend.bat
# Server runs on http://localhost:8000
```

### Terminal 4: Frontend (React)
```bash
cd frontend/frontend
npm run dev
# App runs on http://localhost:5173
```

Open your browser and navigate to **http://localhost:5173**

## 📁 Project Structure

```
music-app/
├── backend/                 # Core Express backend (Auth, Users, Playlists)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/        # Authentication logic
│   │   │   └── users/       # User management
│   │   └── routes.ts        # API routes
│   └── prisma/
│       └── schema.prisma    # Database schema
│
├── backend-nest/            # Secondary NestJS backend (Contact)
│   └── src/
│       └── contact/         # Contact form handling
│
├── scripts/                 # AI Service (FastAPI)
│   ├── main.py             # FastAPI application
│   ├── db.py               # PostgreSQL access layer
│   ├── deezer_client.py    # Deezer API client
│   ├── ingest_songs.py     # Song ingestion pipeline
│   ├── vector_store.py     # ChromaDB vector store
│   ├── recommendation_engine.py  # AI recommendation logic
│   └── seed_songs.py       # Database seeding script
│
├── frontend/
│   └── frontend/           # React frontend
│       ├── src/
│       │   ├── components/  # React components
│       │   ├── services/   # API service layer
│       │   ├── config/     # Configuration files
│       │   └── pages/      # Page components
│       └── vite.config.ts  # Vite configuration
│
└── README.md
```

## 🔌 API Endpoints

### Core Backend (Port 4000)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth
- `GET /api/users/me` - Get current user
- `GET /api/playlists` - Get user playlists
- `POST /api/playlists` - Create playlist

### AI Service (Port 8000)
- `GET /api/songs` - Get songs (with genre/type filters)
- `GET /api/songs/{id}` - Get song by ID
- `GET /api/trending` - Get trending songs
- `GET /api/recommend` - Get AI recommendations
- `GET /api/history` - Get listen history
- `POST /api/listen` - Log a listen event
- `GET /api/discover` - Discover new songs
- `POST /api/admin/deezer/refresh` - Trigger Deezer ingestion

### Secondary Backend (Port 4001)
- `POST /api/contact` - Submit contact form

## 🎯 Key Features Explained

### AI Recommendations
The system uses Google Gemini embeddings to create vector representations of songs. When you listen to music, it:
1. Tracks your listening history
2. Computes average embedding from your recent listens
3. Finds similar songs using vector similarity search
4. Returns personalized recommendations

### Genre Support
- All, Rock, Pop, Jazz, Hip Hop, Rap, Electronic, R&B, Indie, Metal, Classical, Country

### Data Sources
- **Deezer API** - Real music data (100+ songs per genre)
- **PostgreSQL** - Persistent storage for songs, users, playlists
- **ChromaDB** - Vector database for AI embeddings

## 🛠️ Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend/frontend
npm test
```

### Database Migrations
```bash
cd backend
npx prisma migrate dev --name migration_name
npx prisma generate
```

### Resetting Vector Store
If you encounter embedding dimension mismatches:
```bash
# Delete the ChromaDB collection folder
rm -rf music_db  # Linux/Mac
Remove-Item -Recurse -Force music_db  # Windows PowerShell
```

## 📝 Environment Variables

See `.env.example` files in each service directory for required environment variables.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_API_KEY` - Google Gemini API key for embeddings
- `JWT_SECRET` - Secret key for JWT tokens

**Optional:**
- `GOOGLE_CLIENT_ID` - For Google OAuth
- `EMBEDDING_MODEL` - Override default embedding model

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Deezer API](https://developers.deezer.com/) for music data
- [Google Gemini](https://ai.google.dev/) for AI embeddings
- [FastAPI](https://fastapi.tiangolo.com/) for the Python backend
- [React](https://react.dev/) for the frontend framework
- [ChromaDB](https://www.trychroma.com/) for vector storage

## 📧 Support

For support, email your-email@example.com or open an issue in the repository.

## 🗺️ Roadmap

- [ ] User playlists management
- [ ] Social features (sharing, following)
- [ ] Advanced search filters
- [ ] Music player with queue
- [ ] Mobile app (React Native)
- [ ] Real-time collaborative playlists

---

Made with ❤️ using AI and modern web technologies
