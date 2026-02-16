import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useAuth } from '../../context/AuthContext.jsx';

const NavbarLogged = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const username = user?.username ?? '';

  const userImage = null;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gray-800 shadow-md px-2 sm:px-4 py-3">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <Link 
          to="/home" 
          className="text-xl font-bold text-white flex-shrink-0 hover:text-purple-400 transition-colors"
          data-testid="navbar-logo"
        >
          Music App
        </Link>

        <button
          className="md:hidden ml-auto mr-2 flex items-center text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          data-testid="mobile-menu-toggle"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>

        <div className="hidden md:block md:w-1/3 lg:w-2/5 mx-2">
          <SearchBar />
        </div>

        <div className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row w-full md:w-auto md:items-center gap-4 md:gap-6 mt-4 md:mt-0`}>
          <div className="md:hidden w-full mb-4">
            <SearchBar />
          </div>

          <NavLink 
            to="/about" 
            className={({ isActive }) => `transition py-2 md:py-0 ${isActive ? 'text-indigo-400 font-medium' : 'text-white hover:text-indigo-600'}`}
            data-testid="navbar-about-link"
          >
            About
          </NavLink>
          <NavLink 
            to="/contact" 
            className={({ isActive }) => `transition py-2 md:py-0 ${isActive ? 'text-indigo-400 font-medium' : 'text-white hover:text-indigo-600'}`}
            data-testid="navbar-contact-link"
          >
            Contact
          </NavLink>
          <Link 
            to="/trendingsongsall" 
            className="text-white hover:text-indigo-600 transition py-2 md:py-0"
            data-testid="navbar-trending-link"
          >
            Trending
          </Link>
          <Link 
            to="/likedsongs" 
            className="text-white hover:text-indigo-600 transition py-2 md:py-0"
            data-testid="navbar-favourites-link"
          >
            Favourites
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center text-white hover:text-indigo-600 transition py-2 md:py-0"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              onMouseEnter={() => setIsProfileDropdownOpen(true)}
              data-testid="navbar-profile-btn"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
              </svg>
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20" onMouseLeave={() => setIsProfileDropdownOpen(false)}>
                <Link 
                  to="/profile" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  data-testid="dropdown-profile-link"
                >
                  View Profile
                </Link>
                <Link 
                  to="/profilesettings" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  data-testid="dropdown-settings-link"
                >
                  Profile Settings
                </Link>
                <button 
                  type="button" 
                  onClick={handleLogout} 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  data-testid="dropdown-logout-btn"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarLogged;
