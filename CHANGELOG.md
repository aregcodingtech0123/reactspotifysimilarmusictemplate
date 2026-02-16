# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release
- AI-powered music recommendations using Google Gemini embeddings
- Integration with Deezer API for real music data
- Multi-service architecture (Express, NestJS, FastAPI)
- React frontend with modern UI
- User authentication with JWT and Google OAuth
- Song ingestion pipeline from Deezer
- Vector similarity search for recommendations
- Genre filtering (12+ genres)
- Listen history tracking
- Trending songs based on play counts
- Discover new songs feature

### Changed
- Migrated from mock data to real Deezer API integration
- Replaced Node.js seed script with Python-based ingestion system
- Updated vector store to handle batch embeddings (100 items per batch)
- Improved error handling and logging

### Fixed
- Fixed batch size limits for Gemini API embeddings
- Fixed embedding dimension mismatches in ChromaDB
- Fixed database connection pooling issues
- Fixed CORS configuration for multi-service architecture

## [1.0.0] - 2024-02-16

### Added
- Initial project setup
- Core backend services
- Frontend application
- Database schema with Prisma
- Basic authentication

---

For detailed commit history, see [GitHub Commits](https://github.com/yourusername/music-app/commits/main)
