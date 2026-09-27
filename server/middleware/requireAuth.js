import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from './asyncHandler.js';

export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Sign in to continue.' });
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(payload.sub);
  if (!req.user) return res.status(401).json({ message: 'This account is no longer available.' });
  next();
});
