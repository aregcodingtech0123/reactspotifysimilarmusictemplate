import React from 'react';
import { Link } from 'react-router-dom';
import { Music2, ListMusic, TrendingUp, Heart, Sparkles } from 'lucide-react';

/**
 * About page content: hero + sections. Matches app design (bg-[#121826], gray-800, purple/indigo).
 */
const AboutPageContent = () => {
  const features = [
    {
      icon: Music2,
      title: 'Discover music',
      description: 'Explore millions of tracks across genres and find new favorites.',
      color: 'text-purple-400',
    },
    {
      icon: ListMusic,
      title: 'Create playlists',
      description: 'Build and organize your own playlists for every mood and moment.',
      color: 'text-indigo-400',
    },
    {
      icon: TrendingUp,
      title: 'Follow trends',
      description: 'See what\'s trending and stay in tune with the latest hits.',
      color: 'text-cyan-400',
    },
    {
      icon: Heart,
      title: 'Save favorites',
      description: 'Like songs and albums and access them anytime from your library.',
      color: 'text-pink-400',
    },
  ];

  return (
    <div className="min-h-screen bg-[#121826] text-white">
      {/* Hero */}
      <section className="relative py-16 md:py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-[#121826]" />
        <div className="relative z-10 container mx-auto max-w-4xl text-center">
          <div className="flex justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span className="text-purple-400 font-medium tracking-wider uppercase text-sm">
              About Music App
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Music for everyone
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Our mission is to bring you closer to the music you love. Discover, curate, and enjoy a seamless listening experience—whether you're exploring new genres or revisiting old favorites.
          </p>
          <Link
            to="/discover"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg shadow-purple-500/20"
          >
            <Music2 size={20} />
            Explore music
          </Link>
        </div>
      </section>

      {/* What we offer */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">
            What you can do
          </h2>
          <p className="text-gray-400 text-center mb-10 max-w-xl mx-auto">
            From discovery to your personal library—everything in one place.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description, color }) => (
              <div
                key={title}
                className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600 transition-colors"
              >
                <Icon className={`w-8 h-8 ${color} mb-4`} />
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-12 md:py-16 px-4 border-t border-gray-800">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Our vision
          </h2>
          <p className="text-gray-300 leading-relaxed">
            We believe music should be simple to find, easy to organize, and always at your fingertips. Whether you're discovering new artists or building the perfect playlist for your day, we're here to make every listen count.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutPageContent;
