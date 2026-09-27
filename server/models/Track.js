import mongoose from 'mongoose';

const trackSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  artist: { type: String, required: true, trim: true },
  album: { type: String, required: true, trim: true },
  duration: { type: Number, required: true, min: 1 },
  coverUrl: { type: String, default: '' },
  audioUrl: { type: String, default: '' },
  genre: { type: String, default: 'Electronic' },
  plays: { type: Number, default: 0 }
}, { timestamps: true });

trackSchema.index({ title: 'text', artist: 'text', album: 'text' });
export default mongoose.model('Track', trackSchema);
