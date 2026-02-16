import { Navigate, Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';

/**
 * Layout for public home page (not logged-in users).
 * If authenticated, redirect to /home (logged-in home)
 */
export function PublicHomeLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121826] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }
  
  // If user is logged in, redirect to /home
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#121826]">
      <Navbar />
      <main className="flex-1 pt-14">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
