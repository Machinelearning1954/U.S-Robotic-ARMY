# U.S. Robotic ARMY

A landing page featuring an embedded Instagram Reel.

## Contents

- `index.html` — Standalone page that embeds the featured Instagram Reels
  ([reel/DaB2WCzTrtP](https://www.instagram.com/reel/DaB2WCzTrtP/) and
  [reel/DZwL33cy45c](https://www.instagram.com/reel/DZwL33cy45c/)) using
  Instagram's official embed markup and `embed.js` script.

## The embeds

Each reel is embedded with Instagram's supported `blockquote.instagram-media`
markup plus the async `//www.instagram.com/embed.js` loader, which transforms
the blockquotes into the rich, interactive players. A single `embed.js` loader
processes every blockquote on the page. A plain link inside each blockquote acts
as a graceful fallback if the script is blocked or fails to load.

## Running locally

Open `index.html` in a browser, or serve it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

> Note: `embed.js` requires an internet connection to render the interactive
> reel. Without network access, the fallback link is shown instead.
