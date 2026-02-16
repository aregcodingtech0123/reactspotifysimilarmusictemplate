import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Sparkles } from 'lucide-react';

const PublicHeroSection = () => {
  // Placeholder video URL - easily replaceable
  const heroVideoUrl = 'https://cdn.pixabay.com/video/2020/10/02/50774-466878697_large.mp4';

  return (
    <div data-testid="public-hero-section" className="relative h-[70vh] min-h-[500px] overflow-hidden">
      {/* Video Background */}
      <video
        data-testid="hero-video"
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={heroVideoUrl} type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-gray-900" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <span className="text-purple-400 font-medium tracking-wider uppercase text-sm">
            Music Streaming Platform
          </span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 max-w-4xl leading-tight">
          Feel the Beat,<br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
            Live the Music
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
          Discover millions of songs, create playlists, and experience music like never before.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/discover"
            data-testid="hero-start-listening-btn"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30"
          >
            <Play size={20} />
            Start Listening
          </Link>
          <Link
            to="/register"
            data-testid="hero-register-btn"
            className="flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-3 px-8 rounded-full border border-white/30 transition-all duration-300"
          >
            Create Account
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-12 flex flex-wrap gap-8 md:gap-16 justify-center text-white/80">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white">10M+</div>
            <div className="text-sm text-gray-400">Songs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white">500K+</div>
            <div className="text-sm text-gray-400">Artists</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white">1M+</div>
            <div className="text-sm text-gray-400">Users</div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#111827"/>
        </svg>
      </div>
    </div>
  );
};

export default PublicHeroSection;
