/**
 * Express app: middleware and API routes.
 * No listen() here — server.ts boots the app.
 */
import express from 'express';
import cors from 'cors';
import { apiRoutes } from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());

app.use('/api', apiRoutes);
console.log('[App] API routes mounted at /api');

// 404 for all other paths (catch-all, must be last)
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { message: 'Not found' } });
});

app.use(errorMiddleware);

export default app;
