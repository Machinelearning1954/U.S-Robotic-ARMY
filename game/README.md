# U.S. Robotic Army — Campaign

A top-down, GTA-inspired mission shooter. You are **ARES-7**, the last loyal combat android, fighting to retake the nation's automated defense grid from a rogue AI.

**Play it:** open `game/index.html` in any browser. No build step, no dependencies.

Two modes:

- **Campaign** (`index.html`) — the 16-mission story
- **Liberty Bay free roam** (`city.html`) — GTA-style open city: a 3200×2400 scrolling world with procedural blocks, jackable cars with acceleration/steering physics, wandering pedestrians that panic at gunfire, and RoboCop police with a 5-star wanted system (crime raises it, laying low drops it). Minimap included.

## Controls

| Input | Action |
|---|---|
| WASD / arrow keys | Move |
| Mouse | Aim |
| Click / hold | Fire |
| 1–6 | Switch weapon |
| E | Enter / exit vehicle |

## Weapon & inventory system

Weapons drop from enemies and persist across missions. Ammo drops too — the pistol never runs dry.

1. **MK-1 Pistol** — infinite ammo sidearm
2. **RA-15 Rifle** — fast-firing workhorse (drops in Mission 2)
3. **Scatter Cannon** — 6-pellet close-range shredder
4. **Plasma Laser** — high damage, pinpoint accuracy
5. **Railgun** — massive single-shot damage (drops in Mission 10)
6. **M-134 Minigun** — extreme fire rate bullet hose (drops in Mission 15)

## Vehicles

Inspired by [OpenRW](https://github.com/rwengine/openrw)-style GTA mechanics: walk up to a vehicle and press **E** to board. Driving is twice as fast as walking, the hull absorbs all damage while you're inside, and anything you drive over takes ram damage. If the hull reaches zero it explodes — bail out before that.

## Campaign — 16 missions

1. **Boot Camp** — reach the extraction beacon
2. **First Contact** — destroy 5 rogue drones
3. **Supply Run** — collect 4 supply crates under fire
4. **Perimeter Defense** — survive 45 seconds of waves
5. **Intel Heist** — steal the data chip and extract
6. **Convoy Escort** — keep the hauler alive to the east gate
7. **Sabotage** — destroy 3 auto-turret emplacements
8. **Blackout** — kill the shield generator, survive the lockdown
9. **Rescue Op** — reach Dr. Reyes and escort her out alive
10. **Final Assault** — boss fight vs. the TITAN-class siege mech
11. **Aftershock** — the AI's backup escapes; eliminate 12 remnant hostiles
12. **Ghost Protocol** — survive 40 seconds against melee-only STALKER hunters
13. **Long Shot** — destroy 4 long-range sniper droids
14. **Scorched Earth** — burn 4 guarded fuel depots
15. **Warlord** — final boss fight vs. the HYDRA war platform (it spawns stalkers)
16. **Exodus** — steal the K-9 APC and drive to extraction while the wanted level (★–★★★★★) escalates the swarm

Health carries between missions (minimum 60 HP on deploy). Dying restarts the current mission only.
