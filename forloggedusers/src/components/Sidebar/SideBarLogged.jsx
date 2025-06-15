import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { HomeIcon, TrendingUpIcon, HeartIcon, ClockIcon, CompassIcon } from 'lucide-react';

const SidebarLogged = ({ isOpen }) => {
  const params = useParams();
  const username = params.username || '';

  // Debug için - geliştirme aşamasında kontrol etmek faydalı olabilir
  console.log('Current username param:', username);

  return (
    <div className="p-4">
      {isOpen && <h2 className="text-xl font-bold mb-6 pl-2">Music App</h2>}
      <nav className="space-y-4">
        <Link
          to={username ? `/${username}/` : '/'}
          className={`flex items-center gap-3 p-2 rounded hover:bg-gray-700 ${!isOpen && 'justify-center'}`}
        >
          <HomeIcon size={20} />
          {isOpen && <span>Home</span>}
        </Link>
        <Link
          to={username ? `/${username}/category/All` : '/category/All'}
          className={`flex items-center gap-3 p-2 rounded hover:bg-gray-700 ${!isOpen && 'justify-center'}`}
        >
          <TrendingUpIcon size={20} />
          {isOpen && <span>Trends</span>}
        </Link>
        <Link
          to={username ? `/${username}/likedsongs` : '/login'}
          className={`flex items-center gap-3 p-2 rounded hover:bg-gray-700 ${!isOpen && 'justify-center'}`}
        >
          <HeartIcon size={20} />
          {isOpen && <span>Favourites</span>}
        </Link>
        <Link
          to={username ? `/${username}/history` : '/login'}
          className={`flex items-center gap-3 p-2 rounded hover:bg-gray-700 ${!isOpen && 'justify-center'}`}
        >
          <ClockIcon size={20} />
          {isOpen && <span>History</span>}
        </Link>
        <Link
          to={username ? `/${username}/category/All` : '/category/All'}
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