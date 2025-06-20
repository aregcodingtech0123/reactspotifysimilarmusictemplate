import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom'; // Import useParams
import SearchBar from "./SearchBar";

const NavbarLogged = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Extract username from URL params
  const { username } = useParams();
  
  const userImage = null; // Default to null to show the user icon

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-gray-800 shadow-md px-2 sm:px-4 py-3 sticky top-0 z-10">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        
        <div className="text-xl font-bold text-white flex-shrink-0">Music App</div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden ml-auto mr-2 flex items-center text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
        
        {/* Search bar - hidden on smaller screens, shown inline on medium and up */}
        <div className="hidden md:block md:w-1/3 lg:w-2/5 mx-2">
          <SearchBar />
        </div>
        
        {/* Navigation Links */}
        <div className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row w-full md:w-auto md:items-center gap-4 md:gap-6 mt-4 md:mt-0`}>
          {/* Search bar for mobile - only shown when menu is open */}
          <div className="md:hidden w-full mb-4">
            <SearchBar />
          </div>
          
          <a href={`/${username}/about`}className="text-white hover:text-indigo-600 transition py-2 md:py-0">About</a>
          <a href={`/${username}/trending`} className="text-white hover:text-indigo-600 transition py-2 md:py-0">Trending</a>
          <a href={`/${username}/likedsongs`} className="text-white hover:text-indigo-600 transition py-2 md:py-0">Favourites</a>
          
          {/* Profile Icon with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              className="flex items-center text-white hover:text-indigo-600 transition py-2 md:py-0"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              onMouseEnter={() => setIsProfileDropdownOpen(true)}
            >
              {/* User icon SVG */}
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20" onMouseLeave={() => setIsProfileDropdownOpen(false)}>
                <a 
                  href={`/${username}/profile`} // Use the username from params
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  View Profile
                </a>
                <a 
                  href={`/${username}/profilesettings`}  
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile Settings
                </a>
                <a 
                  href="#" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Log Out
                </a>

              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarLogged;