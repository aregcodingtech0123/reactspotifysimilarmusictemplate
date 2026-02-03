import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { PrivateLayout } from './layouts/PrivateLayout';
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

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },
  {
    element: <PrivateLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/profile', element: <Profile /> },
      { path: '/profilesettings', element: <ProfileSettings /> },
      { path: '/playlist', element: <Playlist /> },
      { path: '/likedsongs', element: <LikedSongs /> },
      { path: '/history', element: <History /> },
      { path: '/about', element: <About /> },
      { path: '/trendingsongsall', element: <TrendingSongsAll /> },
      { path: '/category/:category', element: <Category /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
