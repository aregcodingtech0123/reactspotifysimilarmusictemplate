import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';

const NavbarNotLogged = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-800 shadow-md px-2 sm:px-4 py-3 sticky top-0 z-10">
      <div className="container mx-auto flex flex-wrap justify-between items-center ">
        
        <Link to="/" className="text-xl font-bold text-white flex-shrink-0 hover:text-purple-400 transition-colors">
          Music App
        </Link>
        
       
        <button 
          className="md:hidden ml-auto mr-2 flex items-center text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          data-testid="mobile-menu-toggle"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
        
        
        <div className="hidden md:block md:w-1/3 lg:w-2/5 mx-2">
          <SearchBar />
        </div>
        
        {/* Navigation and Auth buttons */}
        <div className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row w-full md:w-auto md:items-center gap-4 md:gap-6 mt-4 md:mt-0`}>
          {/* Search bar for mobile. This only shown when menu is open */}
          <div className="md:hidden w-full mb-4">
            <SearchBar />
          </div>
          <Link 
            to="/" 
            className="text-white hover:text-indigo-600 transition py-2 md:py-0"
            data-testid="navbar-home-link"
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className="text-white hover:text-indigo-600 transition py-2 md:py-0"
            data-testid="navbar-about-link"
          >
            About
          </Link>

          <div className="flex flex-col md:flex-row gap-2 md:gap-4">
            <Link
              to="/login"
              data-testid="navbar-login-btn"
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 transition text-center"
            >
              Login
            </Link>
            <Link
              to="/register"
              data-testid="navbar-signup-btn"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-center"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarNotLogged;
