# Music Streaming Web App - PRD

## Original Problem Statement
Implement UI, routing, and page structure updates for a music streaming web app (React + Tailwind).

## User Personas
- **Guest User (Not Logged-in)**: Can browse public homepage, discover music, view category pages, see trending songs
- **Authenticated User**: Full access including profile, favorites, history, playlists

## Core Requirements (Static)
1. Public homepage at "/" for NOT logged-in users with hero (video background), Popular Music, Trending Music, Popular Artists, Popular Albums
2. Navbar "Home" redirects to "/" for logged-out users
3. Google OAuth buttons on Login and Sign Up pages
4. Profile page at /profile for logged-in users with user info, playlists, favorites, history
5. Trending Songs page at /trendingsongsall
6. Discover page with sections: New Songs, Trending, Rock, Pop, Jazz, Rap
7. Category pages for Rock, Pop, Jazz, Rap with unique hero sections and sorting (Most Popular/Newest)
8. Sidebar items for Rock, Pop, Jazz, Rap with icons, correct routing
9. Button routing: "Start Listening" -> All Songs, "Explore Songs" -> Discover
10. Fix routing: panel items redirect to correct pages

## What's Been Implemented (Jan 2026)

### Completed Features
- ✅ Public homepage with video hero, Popular Music, Trending Music, Popular Artists, Popular Albums sections
- ✅ PublicHomeLayout for "/" without login requirement
- ✅ PublicSidebarLayout for category/discover/trending pages (accessible without login)
- ✅ Google OAuth "Continue with Google" buttons on Login and Register pages
- ✅ Profile page with user info, playlists tab, favorites tab, history tab
- ✅ Trending Songs page with hero, time filters (All, Today, This Week, This Month), sorting
- ✅ Discover page with all sections: New Songs, Trending, Rock, Pop, Jazz, Rap
- ✅ Category pages for Rock, Pop, Jazz, Rap with unique hero sections:
  - Rock: Red gradient, "Feel the power of electric guitars"
  - Pop: Pink gradient, "Catchy beats, unforgettable melodies"
  - Jazz: Blue gradient, "Smooth rhythms, sophisticated sounds"
  - Rap: Orange gradient, "Words that hit hard, beats that slap"
- ✅ Sorting options (Most Popular / Newest) on category pages
- ✅ Sidebar with genre items (Rock, Pop, Jazz, Rap) with icons and correct routing
- ✅ "Start Listening" button routes to /category/All
- ✅ "Explore Songs" button on logged-in home routes to /discover
- ✅ Navbar Home link works correctly for both logged-in and logged-out users

### Files Created/Modified
- `/src/app/router.tsx` - Updated routing with PublicSidebarLayout
- `/src/app/layouts/PublicSidebarLayout.tsx` - New layout for public pages with sidebar
- `/src/components/HomePage/PublicHomePage.jsx` - Public homepage component
- `/src/components/HomePage/HeroPart/PublicHeroSection.jsx` - Video hero section
- `/src/components/Sections/` - PopularMusicSection, TrendingMusicSection, PopularArtistsSection, PopularAlbumsSection
- `/src/components/Discover/DiscoverPage.jsx` - Discover page with all sections
- `/src/components/Category/CategoryPage.jsx` - Genre-specific category pages
- `/src/components/TrendingMusic/TrendingSongsPage.jsx` - Trending songs page
- `/src/components/Profile/ProfilePage.jsx` - Full profile page
- `/src/components/Sidebar/SideBarLogged.jsx` - Updated sidebar with genres
- `/src/components/Sidebar/SideBarNotLogged.jsx` - Updated sidebar for public
- `/src/pages/public/Login.tsx` - Added Google OAuth button
- `/src/pages/public/Register.tsx` - Added Google OAuth button

## Prioritized Backlog

### P0 - Critical (None remaining)
All core requirements completed.

### P1 - High Priority
- Implement actual Google OAuth backend integration
- Add real music data from API/database
- Implement music player functionality

### P2 - Medium Priority  
- Add search functionality
- Implement user favorites persistence
- Add playlist creation/management

### P3 - Low Priority
- Add user following/followers
- Implement song sharing features
- Add music recommendations based on listening history

## Next Tasks
1. Connect to real backend API for music data
2. Implement backend Google OAuth flow
3. Add music player with actual audio playback
4. Implement search across songs, artists, albums
