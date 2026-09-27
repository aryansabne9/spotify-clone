import { Router } from 'express';
import Playlist from '../models/Playlist.js';
import Track from '../models/Track.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.use(requireAuth);
router.get('/', asyncHandler(async (req, res) => {
  const playlists = await Playlist.find({ owner: req.user.id }).populate('tracks').sort({ updatedAt: -1 });
  res.json({ playlists });
}));
router.post('/', asyncHandler(async (req, res) => {
  const name = req.body.name?.trim();
  if (!name) return res.status(400).json({ message: 'Playlist name is required.' });
  const playlist = await Playlist.create({ name, description: req.body.description || '', owner: req.user.id });
  res.status(201).json({ playlist });
}));
router.patch('/:id/tracks', asyncHandler(async (req, res) => {
  const playlist = await Playlist.findOne({ _id: req.params.id, owner: req.user.id });
  if (!playlist) return res.status(404).json({ message: 'Playlist not found.' });
  const track = await Track.findById(req.body.trackId);
  if (!track) return res.status(404).json({ message: 'Track not found.' });
  const hasTrack = playlist.tracks.some((id) => id.equals(track.id));
  playlist.tracks = hasTrack ? playlist.tracks.filter((id) => !id.equals(track.id)) : [...playlist.tracks, track.id];
  await playlist.save();
  await playlist.populate('tracks');
  res.json({ playlist });
}));
router.delete('/:id', asyncHandler(async (req, res) => {
  const result = await Playlist.deleteOne({ _id: req.params.id, owner: req.user.id });
  if (!result.deletedCount) return res.status(404).json({ message: 'Playlist not found.' });
  res.status(204).end();
}));

export default router;
