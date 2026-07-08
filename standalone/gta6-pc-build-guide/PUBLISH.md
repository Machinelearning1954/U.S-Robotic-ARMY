# How to publish this as its own GitHub repository

Option A — GitHub web UI (fastest):
1. github.com → New repository → name: `gta6-pc-build-guide` → Create (empty, no README).
2. Locally:
   ```
   git clone https://github.com/Machinelearning1954/U.S-Robotic-ARMY -b claude/port-antonio-base-design-lvd49n
   cd U.S-Robotic-ARMY/standalone/gta6-pc-build-guide
   git init && git add . && git commit -m "GTA 6 PC build guide (July 2026 reference)"
   git branch -M main
   git remote add origin https://github.com/Machinelearning1954/gta6-pc-build-guide.git
   git push -u origin main
   ```

Option B — from this Claude session: re-authorize the GitHub connector in
claude.ai settings, then say "create the gta6 repo" and it will be created and
pushed via the API.
