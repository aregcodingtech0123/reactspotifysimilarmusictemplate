/**
 * Server entry: loads env, starts HTTP server.
 */
import app from './app';
import { env } from './config/env';

const server = app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
  console.log(`Environment: ${env.nodeEnv}`);
});

export default server;
