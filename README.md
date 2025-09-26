# SyncDraw
SyncDraw is a lightweight web application for creating and editing designs on a fixed-size canvas (1080×1080 px). Users can add shapes, text, and images, apply transformations like move, resize, and rotate, and adjust styling options such as colors, stroke, opacity, and font size.  

Key features include:

- Add & edit elements: Shapes (rectangle, circle, triangle, line, arrow), text, and uploaded images.
- Transformations: Move, resize, rotate using intuitive selection handles.
- Layer control: Bring forward/backward for single objects.
- Undo/Redo: Supports the last 10 actions.
- Edit panel: Contextual properties panel for selected elements.
- Export: Export current canvas as PNG.
- Persistence: Save/load designs via REST API.
- Design Management: Create new designs, edit existing ones, and browse past designs with optional thumbnails

# Tech Stack

- Framework: React + Redux
- Canvas Management: Konva.js
- Authentication: Clerk

# Setup
Prerequisites
Node.js v18+
Clerk account for authentication

# Installation

- git clone <FRONTEND_REPO_URL>
- cd frontend
- npm install
  (Set Clerk frontend keys and local host url)
- npm run dev

# Out of Scope / Future Work

- Real-time collaboration between multiple users
- Comments and mentions on designs
- These features may be added in future versions.

