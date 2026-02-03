import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { PrivateLayout } from './layouts/PrivateLayout';
import { PublicHomeLayout } from './layouts/PublicHomeLayout';
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

const router = createBrowserRouter([
  // Public home page for not logged-in users
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
  // Private routes for logged-in users
  {
    element: <PrivateLayout />,
    children: [
      { path: '/home', element: <Home /> },
      { path: '/profile', element: <Profile /> },
      { path: '/profilesettings', element: <ProfileSettings /> },
      { path: '/playlist', element: <Playlist /> },
      { path: '/likedsongs', element: <LikedSongs /> },
      { path: '/history', element: <History /> },
      { path: '/about', element: <About /> },
      { path: '/trendingsongsall', element: <TrendingSongsAll /> },
      { path: '/discover', element: <Discover /> },
      // Genre-specific category pages (must come before the generic route)
      { path: '/category/rock', element: <CategoryGenre /> },
      { path: '/category/pop', element: <CategoryGenre /> },
      { path: '/category/jazz', element: <CategoryGenre /> },
      { path: '/category/rap', element: <CategoryGenre /> },
      // Generic category page (All and other categories)
      { path: '/category/:category', element: <Category /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
