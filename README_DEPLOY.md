Deployment guide — Render (backend) + Vercel (frontend)
===============================================

Overview
--------
This repo contains a Node/Socket.IO backend (`server.js`) and a static frontend (`index.html`). For reliable Socket.IO hosting, deploy the backend as a long-running Node service (Render, Railway, Cloud Run). Serve the frontend via Vercel.

Environment variables
---------------------
- `MONGO_URI` — your MongoDB Atlas connection string (example: `mongodb+srv://USER:PASS@buzzimessenger.yoprloo.mongodb.net/?retryWrites=true&w=majority`)
- `SOCKET_URL` — public URL of your backend (e.g. `https://api.buzzimessenger.nl`)

Render (backend)
-----------------
1. Create a Render account and connect your GitHub repository.
2. Create a new **Web Service** with these settings:
   - Branch: `main`
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment: `Node`
3. In Render Dashboard > Environment > Add `MONGO_URI` with your Atlas URI.
4. (Optional) Add custom domain `api.buzzimessenger.nl` and follow DNS instructions from Render.

Vercel (frontend)
------------------
1. Create a Vercel account and connect the same GitHub repo as a separate project (or the same repo but different project settings).
2. In Project Settings > Environment Variables, add `SOCKET_URL` with the backend URL (e.g. `https://api.buzzimessenger.nl`).
3. Ensure Vercel's Build Command is `npm run build` (this generates `public/config.js`).
4. Output directory should be set to the repository root or `public` depending on your Vercel setup. If you set `public` as output, ensure `index.html` is in `public` or adjust routing.
4b. If you prefer to keep `index.html` in repo root, Vercel will still serve it as static file — you can verify in project settings.

DNS and custom domains
----------------------
- Point `buzzimessenger.nl` to Vercel (follow Vercel's DNS setup).
- Point `api.buzzimessenger.nl` to Render (add CNAME/A as Render instructs).

Local Docker (optional)
-----------------------
Build and run backend container locally:
```bash
docker build -t buzzi-backend:latest .
docker run -e MONGO_URI="<your-uri>" -p 3000:3000 buzzi-backend:latest
```

Notes
-----
- Vercel serverless functions are not suitable for long-lived WebSocket connections. That's why backend must be a long-running Node service.
- Keep your Atlas credentials secret. Use Render/Vercel environment variables to store secrets.
