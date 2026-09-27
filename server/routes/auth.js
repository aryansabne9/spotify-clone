import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Track from '../models/Track.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
const issueToken = (user) => jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email });

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email, and password are required.' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  const user = await User.create({ name: name.trim(), email: email.trim(), password });
  res.status(201).json({ token: issueToken(user), user: publicUser(user) });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email?.trim().toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(req.body.password || ''))) return res.status(401).json({ message: 'Email or password is incorrect.' });
  res.json({ token: issueToken(user), user: publicUser(user) });
}));

router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));
router.get('/favorites', requireAuth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('favorites');
  res.json({ tracks: user.favorites });
}));
router.put('/favorites/:trackId', requireAuth, asyncHandler(async (req, res) => {
  const track = await Track.findById(req.params.trackId);
  if (!track) return res.status(404).json({ message: 'Track not found.' });
  const user = await User.findById(req.user.id);
  const exists = user.favorites.some((id) => id.equals(track.id));
  user.favorites = exists ? user.favorites.filter((id) => !id.equals(track.id)) : [...user.favorites, track.id];
  await user.save();
  res.json({ liked: !exists });
}));

export default router;
