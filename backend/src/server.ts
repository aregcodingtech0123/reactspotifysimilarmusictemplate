/**
 * Server entry: loads env, starts HTTP server.
 */
import app from './app';
import { env } from './config/env';
import { testDatabaseConnection } from './config/db';

// Test database connection on startup
testDatabaseConnection().then((connected) => {
  if (!connected) {
    console.warn('⚠️  Server starting without database connection. Some endpoints may fail.');
  }
});

// Değişiklik: Araya "0.0.0.0" ekledik
const server = app.listen(env.port, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${env.port}`);
  console.log(`📦 Environment: ${env.nodeEnv}`);
  console.log(`✅ Available endpoints: /api/health, /api/test, /api/auth/*, /api/users/*, /api/playlists/*, /api/contact/*`);
});

export default server;
