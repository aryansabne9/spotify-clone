import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connectDatabase } from './config/db.js';
import authRoutes from './routes/auth.js';
import trackRoutes from './routes/tracks.js';
import playlistRoutes from './routes/playlists.js';

dotenv.config({ path: new URL('../../.env', import.meta.url) });

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '32kb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'spotify-clone-api' }));
app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/playlists', playlistRoutes);
app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }));
app.use((error, _req, res, _next) => {
  if (error.code === 11000) return res.status(409).json({ message: 'An account with that email already exists.' });
  if (error.name === 'ValidationError' || error.name === 'CastError') return res.status(400).json({ message: error.message });
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') return res.status(401).json({ message: 'Your session has expired. Sign in again.' });
  console.error(error);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

const port = Number(process.env.PORT || 5001);
connectDatabase().then(() => app.listen(port, () => console.log(`Spotify API listening on ${port}`))).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
