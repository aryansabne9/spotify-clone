# Soundroom

A full-stack music library and player demo built with React, Vite, Express, MongoDB, and JWT. The project focuses on music discovery and personal listening flows; it is not affiliated with Spotify and does not stream Spotify's catalog.

## Features

- Account registration and sign-in with hashed passwords and JWT sessions
- Searchable catalog with artist, album, genre, and track views
- Persistent play/pause, previous/next, seek, volume, queue, and recently played state
- Favorites and user-owned playlists backed by MongoDB
- Responsive player and browsing layouts
- Demo catalog seed script and a client fallback catalog

## Requirements

- Node.js 20 or newer and npm
- MongoDB running locally, or a MongoDB connection string

## Local setup

1. Copy `.env.example` to `.env` in this folder and set `JWT_SECRET` to a long random value. Set `MONGODB_URI` if MongoDB is not local.
2. Install dependencies from this folder: `npm install`.
3. Seed the demo catalog: `npm run seed`.
4. Start the API and client together: `npm run dev`.
5. Open `http://localhost:5173`.

The API health check is available at `http://localhost:5001/api/health`. The Vite client can run by itself with `npm run dev --workspace spotify-clone-client`; the API can run by itself with `npm run dev --workspace spotify-clone-server`.

## Environment

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign seven-day JWTs; replace the example value |
| `PORT` | API port, default `5001` |
| `CLIENT_ORIGIN` | Allowed browser origin, default `http://localhost:5173` |
| `VITE_API_URL` | API base URL used by the browser client |

## Notes

The seed uses remote demo cover images and sample audio URLs. Replace those URLs with media you own or are licensed to use before distributing a public build. Audio playback depends on network access to the sample host. This project is a learning portfolio demo, not a production streaming service.

## Vercel

Import this repository into Vercel with **Root Directory left at the repository root** (do not set it to `client`) and use the Express framework preset. The included `vercel.json` builds the Vite client into `public/`; Express serves the SPA fallback and handles `/api/*`. Do not set a separate Output Directory, or Vercel will search `public/` for the Express entrypoint. Add `MONGODB_URI` and a strong `JWT_SECRET` in Vercel Project Settings before using account or playlist features. Do not add secrets to GitHub. Without a hosted MongoDB URI, the demo catalog remains visible but database-backed API features will return errors.
