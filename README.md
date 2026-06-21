# Dadventure: Father's Day Rescue

Static web game and installable PWA built for GitHub Pages deployment.

## Production Structure

This is a clean split static-site build:

- `index.html`: app entry point
- `styles.css`: shared UI and game layout styles
- `src/app.js`: main game flow, hub, motocross world, and route loading
- `src/tinkerbell-dungeon.js`: Tinker Bell pirate ship dungeon and 3-deck Hook battle
- `vendor/three.module.js`: checked-in Three.js runtime for static hosting
- `service-worker.js`: offline/static asset caching
- `manifest.webmanifest`: install metadata for supported devices

All runtime paths are relative so the site works from a GitHub Pages repository URL.

## Run Locally

```powershell
python -m http.server 8000
```

or

```powershell
npm run serve
```

Then open `http://localhost:8000`.

## Validate

```powershell
npm test
```

This checks JavaScript syntax and validates that the required production files and cached assets are present.

## GitHub Pages Deployment

1. Create a new GitHub repository.
2. Upload the project files from this folder to the repository root.
3. Commit and push the files.
4. In GitHub, open the repository.
5. Go to `Settings`.
6. Open `Pages`.
7. Under `Build and deployment`, choose:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main` (or your default branch)
   - `Folder`: `/ (root)`
8. Save the settings.
9. Wait for GitHub Pages to publish the site.
10. GitHub will show the live URL near the top of the Pages settings panel.

If the site shows an older build after an update, hard refresh once so the browser picks up the latest service worker cache version.

## How To Play

The page uses a normal scrolling layout:

- On phones and tablets, scroll down slightly if needed so the whole game area and touch controls are visible together.
- The Tinker Bell world places the game canvas above the controls panel.
- The motocross world uses its own race HUD and touch buttons when applicable.

### Controls

- Mobile:
  - Use the on-screen D-pad and action buttons.
- Desktop:
  - Movement: `Arrow Keys` or `WASD`
  - Tinker Bell attack: `Space`
  - Tinker Bell open/interact: `E`
  - Motocross gas: `Up`, `W`, or `Space`
  - Motocross trick/boost: `Shift`, `Enter`, or `B`

## Current Included Features

- Intro and player naming flow
- Hub world selection
- Motocross world
- Tinker Bell pirate ship world
- Three-deck dungeon progression
- Tick-Tock crocodile boss mechanic
- Shuffled no-repeat Adam damage dialogue
- Hook cinematic defeat, key drop, and final cage rescue sequence
- Final unlock flow after both worlds are completed

## Planning Files

- `PLAYTEST.md`: manual testing checklist
- `CONTENT-TODO.md`: content questions and personal detail tracking
