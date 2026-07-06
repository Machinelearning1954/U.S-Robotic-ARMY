# U.S. Robotic Army

A browser-based arcade defense game with a media-ingestion pipeline: external media
links (YouTube videos, Instagram reels, …) are cataloged as structured data and
surfaced in-game as unlockable **Intel Files**.

## Play

Open `game/index.html` in any browser — no build step, no server required.

| Key | Action |
|-----|--------|
| ← / → or A / D | Move the robot |
| SPACE | Fire |
| TAB | Open/close Intel Files |
| ENTER | Start / restart |

Clear a wave of enemy drones to declassify the next Intel File.

## Data ingestion

Media links are ingested into two places:

- **`data/media_catalog.json`** — the canonical machine-readable catalog.
- **`game/data/catalog.js`** — a JS mirror the game loads (kept as a global so
  the game works from `file://`, where `fetch()` of local JSON is blocked).

To ingest a new media link, add an entry to both files with:
`id`, `source`, `url`, `title`, `channel`, `published`, `topic`, and an
`ingest_status` of either:

- `metadata_only` — the link was identified (title/channel/date verified via
  public search) but the media content itself was not retrievable.
- `inaccessible` — the link could not be identified at all.
- `full` — reserved for entries where actual content (transcript, frames,
  extracted data) has been ingested.

The catalog is honest by design: entries only record what was actually
verified, and each notes how the information was obtained.

## Layout

```
data/media_catalog.json   # canonical media catalog (JSON)
game/index.html           # the game (self-contained HTML5 canvas)
game/data/catalog.js      # catalog mirror consumed by the game
```
