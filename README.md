# U.S. Robotic Army — Autonomous Military Vehicle Recognition

A landing page for the Autonomous Military Vehicle Recognition and Tactical AI System
capstone project, featuring an embedded field-demonstration Instagram Reel.

## Instagram Reel Integration

The featured reel is embedded on `index.html` using Instagram's official embed:

- **Reel:** https://www.instagram.com/reel/Dap2yhMRnur/
- **Method:** an `.instagram-media` blockquote processed by `https://www.instagram.com/embed.js`,
  which Instagram renders into the full reel player client-side.
- A plain-link fallback is shown if the embed script is blocked or fails to load.

### Viewing

Open `index.html` in a browser, or serve it locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

An internet connection is required for the embed script to load and render the reel.

## Project

- **Datasets:** Indian Vehicle Dataset (50k+ images) and Military Assets Dataset (26k+ images, 12 classes)
- **Task:** vehicle object detection and classification (YOLO / COCO / PASCAL-VOC formats)
- **Current step:** Step 2 — Data Collection
