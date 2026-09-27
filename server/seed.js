import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from './config/db.js';
import Track from './models/Track.js';

dotenv.config({ path: new URL('../.env', import.meta.url) });

const tracks = [
  { title: 'Night Drive', artist: 'The Midnight', album: 'After Hours', duration: 231, genre: 'Synthwave', coverUrl: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=500&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', plays: 5400 },
  { title: 'Soft Focus', artist: 'Luna Park', album: 'Somewhere Quiet', duration: 198, genre: 'Indie', coverUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=500&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', plays: 4200 },
  { title: 'Open Water', artist: 'Milo June', album: 'Blue Hour', duration: 215, genre: 'Alternative', coverUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=500&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', plays: 3800 },
  { title: 'Satellite Heart', artist: 'Kira Sol', album: 'Orbit', duration: 204, genre: 'Pop', coverUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=500&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', plays: 3500 },
  { title: 'A Good Thing', artist: 'Common Ground', album: 'Easy Does It', duration: 187, genre: 'Soul', coverUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=500&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', plays: 2900 },
  { title: 'Slow Motion', artist: 'Lena Grey', album: 'Little Weather', duration: 242, genre: 'Electronic', coverUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=500&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', plays: 2600 },
  { title: 'Postcards', artist: 'Weekend Club', album: 'Away Days', duration: 193, genre: 'Indie', coverUrl: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=500&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', plays: 2200 },
  { title: 'First Light', artist: 'Eli North', album: 'New Ground', duration: 226, genre: 'Alternative', coverUrl: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=500&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', plays: 1900 }
];

try {
  await connectDatabase();
  await Track.deleteMany({});
  await Track.insertMany(tracks);
  console.log(`Seeded ${tracks.length} demo tracks.`);
} finally {
  await mongoose.disconnect();
}
