import { Router } from 'express';
import Track from '../models/Track.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.get('/', asyncHandler(async (req, res) => {
  const filter = req.query.q ? { $text: { $search: req.query.q } } : {};
  const tracks = await Track.find(filter).sort(req.query.q ? { score: { $meta: 'textScore' } } : { plays: -1 }).limit(60);
  res.json({ tracks });
}));
router.get('/:id', asyncHandler(async (req, res) => {
  const track = await Track.findById(req.params.id);
  if (!track) return res.status(404).json({ message: 'Track not found.' });
  res.json({ track });
}));
router.post('/:id/play', asyncHandler(async (req, res) => {
  const track = await Track.findByIdAndUpdate(req.params.id, { $inc: { plays: 1 } }, { new: true });
  if (!track) return res.status(404).json({ message: 'Track not found.' });
  res.json({ track });
}));

export default router;
