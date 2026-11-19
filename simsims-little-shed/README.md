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

Two successful exchanges with the same male unlock a nesting box and a small self-view mirror. The partner sits on the egg for thirty real minutes; incubation continues while the game is closed. Little Pip inherits a mix of the parents' feather colours. Eating adds five seeds; every twenty seconds of flight removes ten, down to zero. Body size changes independently of head size. Princess is timid; Grizzle has salt-and-pepper markings.

Press **V** to switch first/third person. **F** takes off; while flying, W/S move forward/back, A/D move sideways, left/right arrows turn and up/down arrows change altitude. Drag to look around. **L** lands on the house roof directly below you. Birds on an active flock flight land alongside Simsim; **R** returns to the shed roof. In the shed, flight is bounded by the walls and ceiling; pass through the upper-left trap opening to leave. From the home roof, **P** returns through the trap.

Relationships, seeds, egg/baby, incubation time and settings save automatically in the same browser and origin. Under **Sound & saves**, export/import a JSON backup to move between browsers or downloaded game filenames. Clearing browser storage removes local progress unless a backup was exported.

Under **Sound & saves**, select the supplied Simsim and male recordings using the two audio-loading buttons. The clips persist with the save and are included in exported backups. Male replies are limited to five seconds at normal speed. Until clips are loaded, procedural sounds are used. Separate ambience, effects and music sliders and mute are available. The recordings could not be downloaded in the build environment, so no recorded audio is bundled in this commit.

Progress is stored locally where the browser allows it. Outdoor scenery is approximate and is not an exact satellite reconstruction.

## Files

- `index.html`: game interface
- `style.css`: full-screen layout and overlays
- `game3d.js`: self-contained WebGL renderer, simulation, and procedural audio
- `upgrade.js`: persistent family progression, manual flight, third-person view, audio loading, and detailed scenery

## Validation

JavaScript syntax and simulated game-state checks passed for two-coo partnering, save/reload of relationships and babies, exact thirty-minute incubation, inherited colours, manual indoor/outdoor flight, local rooftop landing, third-person camera, grounded walking, and flight weight. Live visual browser testing remains outstanding.

Fly straight out from the trap for about 45 seconds to find another house and pigeon shed. The cowboy walks the garden and refills the bowl on his first visit and every 24 real hours after that. Each snack uses five seeds from the bowl.
