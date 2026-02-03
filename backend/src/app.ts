/**
 * Express app: middleware and API routes.
 * No listen() here — server.ts boots the app.
 */
import express from 'express';
import cors from 'cors';
import { apiRoutes } from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

// 404 for unknown API paths
app.use('/api/*', (_req, res) => {
  res.status(404).json({ success: false, error: { message: 'Not found' } });
});

app.use(errorMiddleware);

export default app;
