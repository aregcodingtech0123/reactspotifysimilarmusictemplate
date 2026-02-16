import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { PrivateLayout } from './layouts/PrivateLayout';
import { PublicHomeLayout } from './layouts/PublicHomeLayout';
import { PublicSidebarLayout } from './layouts/PublicSidebarLayout';
import { Login } from '../pages/public/Login';
import { Register } from '../pages/public/Register';
import { Home } from '../pages/private/Home';
import { Profile } from '../pages/private/Profile';
import { Playlist } from '../pages/private/Playlist';
import { About } from '../pages/private/About';
import { TrendingSongsAll } from '../pages/private/TrendingSongsAll';
import { LikedSongs } from '../pages/private/LikedSongs';
import { ProfileSettings } from '../pages/private/ProfileSettings';
import { History } from '../pages/private/History';
import { Category } from '../pages/private/Category';
import { Discover } from '../pages/private/Discover';
import { CategoryGenre } from '../pages/private/CategoryGenre';
import { PublicHome } from '../pages/public/PublicHome';
import { Contact } from '../pages/Contact';
import { SongDetail } from '../pages/SongDetail';
import { Artist } from '../pages/Artist';
import { Album } from '../pages/Album';

const router = createBrowserRouter([
  // Public home page for not logged-in users (no sidebar)
  {
    element: <PublicHomeLayout />,
    children: [
      { path: '/', element: <PublicHome /> },
    ],
  },
  // Auth pages (login/register)
  {
    element: <PublicLayout />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },
  // Public pages with sidebar (accessible without login)
  {
    element: <PublicSidebarLayout />,
    children: [
      { path: '/discover', element: <Discover /> },
      { path: '/trendingsongsall', element: <TrendingSongsAll /> },
      { path: '/about', element: <About /> },
      { path: '/contact', element: <Contact /> },
      { path: '/song/:id', element: <SongDetail /> },
      { path: '/artist/:name', element: <Artist /> },
      { path: '/album/:albumName', element: <Album /> },
      // Genre-specific category pages (public)
      { path: '/category/rock', element: <CategoryGenre /> },
      { path: '/category/pop', element: <CategoryGenre /> },
      { path: '/category/jazz', element: <CategoryGenre /> },
      { path: '/category/rap', element: <CategoryGenre /> },
      // Generic category page (All and other categories)
      { path: '/category/:category', element: <Category /> },
    ],
  },
  // Private routes for logged-in users only
  {
    element: <PrivateLayout />,
    children: [
      { path: '/home', element: <Home /> },
      { path: '/profile', element: <Profile /> },
      { path: '/profilesettings', element: <ProfileSettings /> },
      { path: '/playlist', element: <Playlist /> },
      { path: '/likedsongs', element: <LikedSongs /> },
      { path: '/history', element: <History /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
