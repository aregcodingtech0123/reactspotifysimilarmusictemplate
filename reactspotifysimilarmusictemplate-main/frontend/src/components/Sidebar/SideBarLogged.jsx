import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, TrendingUpIcon, HeartIcon, ClockIcon, CompassIcon } from 'lucide-react';

const SidebarLogged = ({ isOpen }) => {
  return (
    <div className="p-4">
      {isOpen && <h2 className="text-xl font-bold mb-6 pl-2">Music App</h2>}
      <nav className="space-y-4">
        <Link
          to="/"
          className={`flex items-center gap-3 p-2 rounded hover:bg-gray-700 ${!isOpen && 'justify-center'}`}
        >
          <HomeIcon size={20} />
          {isOpen && <span>Home</span>}
        </Link>
        <Link
          to="/category/All"
          className={`flex items-center gap-3 p-2 rounded hover:bg-gray-700 ${!isOpen && 'justify-center'}`}
        >
          <TrendingUpIcon size={20} />
          {isOpen && <span>Trends</span>}
        </Link>
        <Link
          to="/likedsongs"
          className={`flex items-center gap-3 p-2 rounded hover:bg-gray-700 ${!isOpen && 'justify-center'}`}
        >
          <HeartIcon size={20} />
          {isOpen && <span>Favourites</span>}
        </Link>
        <Link
          to="/history"
          className={`flex items-center gap-3 p-2 rounded hover:bg-gray-700 ${!isOpen && 'justify-center'}`}
        >
          <ClockIcon size={20} />
          {isOpen && <span>History</span>}
        </Link>
        <Link
          to="/category/All"
          className={`flex items-center gap-3 p-2 rounded hover:bg-gray-700 ${!isOpen && 'justify-center'}`}
        >
          <CompassIcon size={20} />
          {isOpen && <span>Discover</span>}
        </Link>
      </nav>
    </div>
  );
};

export default SidebarLogged;
