# U.S. Robotic Army — Autonomous Military Vehicle Recognition

A landing page for the Autonomous Military Vehicle Recognition and Tactical AI System
capstone project, featuring an embedded field-demonstration Instagram Reel.

## Instagram Reel Integration

The featured reels are embedded on `index.html` using Instagram's official embed:

- **Reel 1:** https://www.instagram.com/reel/Dap2yhMRnur/
- **Reel 2:** https://www.instagram.com/reel/DaQV4vdyCTq/
- **Method:** `.instagram-media` blockquotes processed by `https://www.instagram.com/embed.js`,
  which Instagram renders into the full reel players client-side.
- Plain-link fallbacks are shown if the embed script is blocked or fails to load.

### Viewing

Open `index.html` in a browser, or serve it locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

An internet connection is required for the embed script to load and render the reel.

## Vice Patrol — the training game

`game.html` is an original browser mini-game (single file, no dependencies) that turns the
project's vehicle-recognition mission into gameplay. Feature set was blueprinted from a set
of GTA 6 feature infographics supplied as reference (mechanics only — no copyrighted assets):

- **Driving & exploration** — free-roam top-down driving across a wrapped city road grid
- **Vehicle recognition missions** — scan the target class (CAR, VAN, TRUCK, PICKUP, AMBULANCE, HUMVEE, TANK) for points
- **Police chases** — misidentifications and collisions raise your wanted level; patrol cars pursue until you outrun them
- **Full seasonal changes** — SUMMER / AUTUMN / WINTER / SPRING rotate live, changing visuals, weather particles (leaves, snow, rain), traffic density, and car grip (icy winter physics)
- **In-game feed** — a social-media-style ticker reporting missions, seasons, and chases

Controls: WASD / arrows to drive, hold SPACE to scan. Launch it from the landing page's
"Play Vice Patrol" button or open `game.html` directly.

## Project

- **Datasets:** Indian Vehicle Dataset (50k+ images) and Military Assets Dataset (26k+ images, 12 classes)
- **Task:** vehicle object detection and classification (YOLO / COCO / PASCAL-VOC formats)
- **Current step:** Step 2 — Data Collection
