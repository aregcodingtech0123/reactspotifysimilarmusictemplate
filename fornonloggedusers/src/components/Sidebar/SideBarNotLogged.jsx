import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, TrendingUpIcon, CompassIcon, LogInIcon } from 'lucide-react';

const SidebarNotLogged = ({ isOpen }) => {
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
          to="/category/All"
          className={`flex items-center gap-3 p-2 rounded hover:bg-gray-700 ${!isOpen && 'justify-center'}`}
        >
          <CompassIcon size={20} />
          {isOpen && <span>Discover</span>}
        </Link>
        <Link
          to="/login"
          className={`flex items-center gap-3 p-2 mt-8 bg-blue-600 rounded hover:bg-blue-700 ${!isOpen && 'justify-center'}`}
        >
          <LogInIcon size={20} />
          {isOpen && <span>Login</span>}
        </Link>
      </nav>
    </div>
  );
};

export default SidebarNotLogged;