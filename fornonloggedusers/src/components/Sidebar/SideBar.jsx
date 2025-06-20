import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import SidebarLogged from './SideBarLogged';
import SidebarNotLogged from './SideBarNotLogged';
import { MenuIcon, XIcon } from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Ekran boyutunu kontrol etmek için
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  return (
    <>
      {/* Mobil için menü toggle butonu */}
      <button 
        className={`fixed z-20 top-4 ${isOpen ? 'left-56' : 'left-4'} md:left-4 bg-gray-800 text-white p-2 rounded-md transition-all duration-300 ${isMobile && isOpen ? 'opacity-100' : 'md:opacity-100'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
      </button>

      {/* Sidebar arka planı - mobil için kapatılabilir overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div 
        className={`bg-[#0f1623] text-white overflow-hidden transition-all duration-300 h-screen z-10 ${
          isOpen ? 'w-64' : 'w-16'
        } ${isMobile ? 'fixed' : 'sticky top-0'}`}
      >
        <div className="h-full pt-16"> {/* Navbar'ın altına yerleşmesi için padding-top eklendi */}
          <Routes>
            {/* <Route path="/:username/*" element={<SidebarLogged isOpen={isOpen} />} /> */}
            <Route path="/*" element={<SidebarNotLogged isOpen={isOpen} />} />
          </Routes>
        </div>
      </div>

      
      {isMobile && isOpen && <div className="w-16 md:w-0" />}
      
      {!isMobile && !isOpen && <div className="w-16" />}
    </>
  );
};

export default Sidebar;