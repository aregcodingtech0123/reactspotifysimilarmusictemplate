import { Navigate, Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/SideBar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { SidebarProvider } from '../../context/SidebarContext';

/**
 * Layout for public pages that need sidebar (category pages, discover, trending)
 * These pages are accessible without authentication
 * If logged in, shows logged-in sidebar; otherwise shows public sidebar
 */
export function PublicSidebarLayout() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121826] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-[#121826]">
        <Navbar />
        <div className="flex flex-1 min-w-0">
          <Sidebar />
          <div className="flex-1 min-w-0 transition-[width] duration-300 ease-in-out">
            <Outlet />
          </div>
        </div>
        <Footer />
      </div>
    </SidebarProvider>
  );
}
