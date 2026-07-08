# U.S. Robotic ARMY

A landing page featuring an embedded Instagram Reel.

## Contents

- `index.html` — Standalone page that embeds the featured Instagram Reel
  ([reel/DaB2WCzTrtP](https://www.instagram.com/reel/DaB2WCzTrtP/)) using
  Instagram's official embed markup and `embed.js` script.

## The embed

The reel is embedded with Instagram's supported `blockquote.instagram-media`
markup plus the async `//www.instagram.com/embed.js` loader, which transforms
the blockquote into the rich, interactive player. A plain link inside the
blockquote acts as a graceful fallback if the script is blocked or fails to
load.

## Running locally

Open `index.html` in a browser, or serve it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

> Note: `embed.js` requires an internet connection to render the interactive
> reel. Without network access, the fallback link is shown instead.
