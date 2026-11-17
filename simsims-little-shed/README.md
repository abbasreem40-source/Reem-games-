# Simsim's little shed

A first-person 3D pigeon simulation made for Reem and her flock. Play as Simsim, explore the shed, sit on yellow perches, fly through the pigeon trap, and take a loop over an interpretation of Woodingdean.

## Play

Open `index.html` in Chrome or Edge. No installation, build step, external assets, or server is required. A browser with WebGL support is needed.

Click **Step into Simsim's world** to begin. Sound starts after this interaction and can be muted. The full-screen button expands the game.

| Control | Action |
| --- | --- |
| WASD | Walk |
| Drag / arrow keys | Look around |
| E | Eat seeds |
| P | Fly to a perch / return to floor; enter trap from roof |
| F | Travel through the trap; start an outdoor loop or return to the roof |
| C | Coo towards a nearby male |
| B | Visit a partnered nesting box, lay an egg, or leave |
| H | Help |

Five successful exchanges with the same male unlock a nesting box and a small self-view mirror. Eating adds five seeds; every twenty seconds of flight removes ten, down to zero. Body size changes independently of head size. Princess is timid; Grizzle has salt-and-pepper markings.

Progress is stored locally where the browser allows it. Outdoor scenery is approximate and is not an exact satellite reconstruction.

## Files

- `index.html`: game interface
- `style.css`: full-screen layout and overlays
- `game3d.js`: self-contained WebGL renderer, simulation, and procedural audio

## Validation

JavaScript syntax and simulated game-state checks passed for perches, courtship, box restrictions, eggs, flight weight, trap exit/re-entry, and the outdoor loop. Live visual browser testing remains outstanding.
