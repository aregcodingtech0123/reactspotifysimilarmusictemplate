/**
 * Navbar: shows NavbarLogged when authenticated, NavbarNotLogged otherwise.
 * When inside SidebarProvider (private layout), adds left padding so content does not overlap the sidebar toggle.
 */
import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSidebar } from '../../context/SidebarContext.jsx';
import NavbarLogged from './NavbarLogged.jsx';
import NavbarNotLogged from './NavbarNotLogged.jsx';

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const sidebar = useSidebar();
  const paddingClass = sidebar ? (sidebar.isOpen ? 'pl-64' : 'pl-16') : '';
  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-[padding] duration-300 ease-in-out ${paddingClass}`}>
      {isAuthenticated ? <NavbarLogged /> : <NavbarNotLogged />}
    </div>
  );
};

export default Navbar;
