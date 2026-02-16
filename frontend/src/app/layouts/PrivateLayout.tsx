import { Navigate, Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/SideBar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { SidebarProvider } from '../../context/SidebarContext';

/**
 * Layout for authenticated routes: Navbar, Sidebar, content, Footer.
 * Redirects to "/" (public home) if not authenticated.
 * "/" is now handled by PublicHomeLayout for guests
 */
export function PrivateLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121826] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
