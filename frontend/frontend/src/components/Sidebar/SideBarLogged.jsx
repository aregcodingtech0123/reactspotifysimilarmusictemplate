import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HomeIcon, 
  TrendingUpIcon, 
  HeartIcon, 
  ClockIcon, 
  CompassIcon,
  Guitar,
  Music2,
  Mic2
} from 'lucide-react';

const SidebarLogged = ({ isOpen }) => {
  const mainNavItems = [
    { to: '/home', icon: HomeIcon, label: 'Home' },
    { to: '/trendingsongsall', icon: TrendingUpIcon, label: 'Trends' },
    { to: '/likedsongs', icon: HeartIcon, label: 'Favourites' },
    { to: '/history', icon: ClockIcon, label: 'History' },
    { to: '/discover', icon: CompassIcon, label: 'Discover' },
  ];

  const genreNavItems = [
    { to: '/category/rock', icon: Guitar, label: 'Rock', color: 'text-red-400' },
    { to: '/category/pop', icon: Music2, label: 'Pop', color: 'text-pink-400' },
    { to: '/category/jazz', icon: Music2, label: 'Jazz', color: 'text-blue-400' },
    { to: '/category/rap', icon: Mic2, label: 'Rap', color: 'text-orange-400' },
  ];

  return (
    <div className="p-4 h-full flex flex-col">
      {isOpen && (
        <h2 className="text-xl font-bold mb-6 pl-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Music App
        </h2>
      )}
      
      {/* Main Navigation */}
      <nav className="space-y-2">
        {mainNavItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            data-testid={`sidebar-${item.label.toLowerCase()}`}
            className={`flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-700/50 transition-colors group ${!isOpen && 'justify-center'}`}
          >
            <item.icon size={20} className="text-gray-400 group-hover:text-purple-400 transition-colors" />
            {isOpen && <span className="text-gray-300 group-hover:text-white transition-colors">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <div className="my-4 border-t border-gray-700/50" />

      {/* Genre Navigation */}
      {isOpen && (
        <div className="mb-2 px-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Genres</span>
        </div>
      )}
      <nav className="space-y-2">
        {genreNavItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            data-testid={`sidebar-${item.label.toLowerCase()}`}
            className={`flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-700/50 transition-colors group ${!isOpen && 'justify-center'}`}
          >
            <item.icon size={20} className={`${item.color} group-hover:scale-110 transition-transform`} />
            {isOpen && <span className="text-gray-300 group-hover:text-white transition-colors">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* All Songs Link */}
      <div className="mt-auto pt-4">
        <Link
          to="/discover"
          data-testid="sidebar-all-songs"
          className={`flex items-center gap-3 p-2.5 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/30 transition-all ${!isOpen && 'justify-center'}`}
        >
          <Music2 size={20} className="text-purple-400" />
          {isOpen && <span className="text-purple-300 font-medium">All Songs</span>}
        </Link>
      </div>
    </div>
  );
};

export default SidebarLogged;
