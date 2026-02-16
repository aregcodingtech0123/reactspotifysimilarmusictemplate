/**
 * Sidebar: shows SidebarLogged when authenticated, SidebarNotLogged otherwise.
 * Uses SidebarContext for open state; smooth width transition without layout jump.
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSidebar } from '../../context/SidebarContext.jsx';
import SidebarLogged from './SideBarLogged.jsx';
import SidebarNotLogged from './SideBarNotLogged.jsx';
import { MenuIcon, XIcon } from 'lucide-react';

const SIDEBAR_OPEN_WIDTH = 256;
const SIDEBAR_CLOSED_WIDTH = 64;

const Sidebar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const { isAuthenticated } = useAuth();
  const sidebarContext = useSidebar();
  const setOpenRef = React.useRef(null);
  if (sidebarContext) setOpenRef.current = sidebarContext.setIsOpen;

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && setOpenRef.current) setOpenRef.current(false);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const isOpen = sidebarContext ? sidebarContext.isOpen : true;
  const setOpen = sidebarContext ? sidebarContext.setIsOpen : () => {};
  const toggle = sidebarContext ? sidebarContext.toggle : () => {};

  const SidebarContent = isAuthenticated ? SidebarLogged : SidebarNotLogged;
  const widthPx = isOpen ? SIDEBAR_OPEN_WIDTH : SIDEBAR_CLOSED_WIDTH;

  return (
    <>
      {sidebarContext && (
        <button
          type="button"
          className="fixed z-20 top-4 left-4 bg-gray-800 text-white p-2 rounded-md transition-opacity duration-200 hover:opacity-90"
          style={{ left: isOpen ? Math.min(SIDEBAR_OPEN_WIDTH - 40, widthPx - 40) : 16 }}
          onClick={toggle}
          aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
        </button>
      )}

      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 transition-opacity duration-300"
          onClick={() => setOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Close overlay"
        />
      )}

      <div
        className={`bg-[#0f1623] text-white h-screen z-10 flex-shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${isMobile ? 'fixed left-0 top-0' : 'sticky top-0'}`}
        style={{ width: widthPx, minWidth: widthPx }}
      >
        <div className="h-full pt-16">
          <SidebarContent isOpen={isOpen} />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
