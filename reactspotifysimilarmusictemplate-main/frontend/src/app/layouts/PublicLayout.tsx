import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer';

/**
 * Layout for unauthenticated routes (login, register).
 */
export function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#121826]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
