# Mhare Sangeet — Local Dev

This is a minimal Vite React setup to run `App.jsx` (the interactive Rajasthan music map).

Quick start

1. Install dependencies:

```bash
cd /home/lileskimo/code/digisoc
npm install
```

2. Start the dev server:

```bash
npm run dev
```

Open the URL shown by Vite (usually http://localhost:5173).

Notes
- The app dynamically loads Leaflet and Tailwind CSS from CDNs at runtime. No extra build config required for these.
- If you want Tailwind compiled, integrate Tailwind into the build separately.
