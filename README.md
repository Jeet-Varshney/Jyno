# Jyno — Sneaker Design Platform

## Project Structure

```
Jyno/
├── frontend/          # React + Vite client application
│   ├── public/
│   │   └── models/
│   │       └── shoe.glb           # 3D shoe GLB model (Shopify, CC BY 4.0)
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js          # All API calls to the backend
│   │   ├── components/
│   │   │   ├── layout/            # Navbar, Footer
│   │   │   ├── community/         # DesignCard
│   │   │   └── shoe/
│   │   │       ├── ShoeViewer.jsx # Interactive 3D shoe (Three.js)
│   │   │       └── ShoeViewer.css
│   │   ├── data/
│   │   │   └── mockData.js        # Legacy reference data (no longer imported in pages)
│   │   └── pages/                 # Landing, Studio, Marketplace, Community, etc.
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── backend/           # Express.js REST API server
    ├── server.js      # All API endpoints (designs, creators)
    ├── package.json
    └── .gitignore
```

## Running the App

### 1. Start the Backend (port 5001)
```bash
cd backend
npm install
npm start
```

### 2. Start the Frontend (port 5173)
```bash
cd frontend
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.

## API Endpoints (Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/designs` | List all shoe designs |
| GET | `/api/designs/:id` | Get a single design |
| POST | `/api/designs` | Save a new custom design |
| POST | `/api/designs/:id/like` | Like a design |
| GET | `/api/creators` | List all creators |

## 3D Shoe Viewer

The `ShoeViewer` component uses **Three.js** with a `MaterialsVariantsShoe.glb` model (from [Khronos Group Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets), contributed by Shopify, CC BY 4.0).

It supports:
- Real-time color zone updates (Upper, Sole, Accent, Laces, Tongue)
- OrbitControls (drag to rotate, scroll to zoom)
- Auto-rotation and floating animation
- Proper WebGL resource cleanup on unmount
