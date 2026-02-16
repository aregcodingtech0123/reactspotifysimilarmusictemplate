import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { AppRouter } from './app/router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <PlayerProvider>
        <AppRouter />
      </PlayerProvider>
    </AuthProvider>
  </StrictMode>
);
