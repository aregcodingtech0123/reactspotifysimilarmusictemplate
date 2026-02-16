import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Music, Headphones, Music2 } from 'lucide-react';

const MusicHeroSection = () => {
  const navigate = useNavigate();

  // Navigate to All Songs page
  const handleStartListening = () => {
    navigate('/category/All');
  };

  // Navigate to Discover page
  const handleExploreSongs = () => {
    navigate('/discover');
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
      <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto px-4 py-12">
        {/* Left Side - Text Content */}
        <div className="w-full md:w-1/2 mb-12 md:mb-0">
          <h1 className="text-5xl font-bold mb-4">
            Discover<br />
            your perfect<br />
            rhythm.
          </h1>
          <p className="text-lg mb-8 text-gray-200">
            Unlimited music, personalized playlists, and the latest releases all in one place.
          </p>
          
          {/* CTA Buttons - Now with proper navigation */}
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={handleStartListening}
              data-testid="hero-start-listening-btn"
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-full flex items-center transition"
            >
              <Play size={20} className="mr-2" />
              Start Listening
            </button>
            <button 
              onClick={handleExploreSongs}
              data-testid="hero-explore-songs-btn"
              className="bg-transparent hover:bg-white/10 border border-white text-white font-medium py-3 px-6 rounded-full transition"
            >
              Explore Songs
            </button>
          </div>
          
          {/* Features */}
          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <Music size={20} className="mr-2 text-green-400" />
              <span>Millions of songs</span>
            </div>
            <div className="flex items-center">
              <Headphones size={20} className="mr-2 text-green-400" />
              <span>Emotion-detecting listening</span>
            </div>
            <div className="flex items-center">
              <Music2 size={20} className="mr-2 text-green-400" />
              <span>Custom playlists</span>
            </div>
            <div className="flex items-center">
              <Play size={20} className="mr-2 text-green-400" />
              <span>High-quality audio</span>
            </div>
          </div>
        </div>
        
        {/* Right Side - Music Visual */}
        <div className="w-full md:w-1/2">
          <div className="relative">
            {/* Animated Music Visualization */}
            <div className="w-full h-64 bg-black/20 rounded-lg backdrop-blur-sm p-6 relative overflow-hidden">
              {/* Album Artwork */}
              <div className="absolute left-6 top-1/2 -translate-y-1/2 w-32 h-32 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <Music size={48} />
                </div>
              </div>
              
              {/* Music Waveform */}
              <div className="absolute right-0 top-0 bottom-0 left-44 flex items-center justify-around">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-2 bg-white/80 rounded-full mx-0.5"
                    style={{
                      height: `${20 + Math.sin(i * 0.5) * 25}%`,
                      animationDelay: `${i * 0.1}s`,
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }}
                  />
                ))}
              </div>
              
              {/* infos about song */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md rounded-lg p-3 text-sm">
                <div className="text-white font-bold">Now Playing</div>
                <div className="text-gray-200">Your Favorite Song - Popular Artist</div>
              </div>
            </div>
            
            {/* Floating Music Notes */}
            <div className="absolute -top-10 -right-4">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <path d="M30 20C30 13.4 35.4 8 42 8C48.6 8 54 13.4 54 20V50C54 56.6 48.6 62 42 62C35.4 62 30 56.6 30 50V20Z" stroke="white" strokeWidth="2" opacity="0.6" />
                <line x1="54" y1="20" x2="70" y2="20" stroke="white" strokeWidth="2" opacity="0.6" />
                <circle cx="70" cy="20" r="5" stroke="white" strokeWidth="2" opacity="0.6" />
              </svg>
            </div>
            
            <div className="absolute -bottom-10 -left-4">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <path d="M30 20C30 13.4 35.4 8 42 8C48.6 8 54 13.4 54 20V50C54 56.6 48.6 62 42 62C35.4 62 30 56.6 30 50V20Z" stroke="white" strokeWidth="2" opacity="0.6" />
                <line x1="54" y1="20" x2="70" y2="20" stroke="white" strokeWidth="2" opacity="0.6" />
                <circle cx="70" cy="20" r="5" stroke="white" strokeWidth="2" opacity="0.6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.7); }
        }
      `}</style>
    </div>
  );
};

export default MusicHeroSection;
