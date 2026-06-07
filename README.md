# Dadventure: The Six Worlds of Father's Day

Static mobile web/PWA game prototype. No Python packages or JavaScript packages are required.

## Run Locally

From this folder:

```powershell
python -m http.server 8000
```

Or, with Node installed:

```powershell
npm run serve
```

Then open:

```text
http://localhost:8000
```

## Validate

```powershell
npm test
```

This currently runs a JavaScript syntax check against `src/app.js`.

The game can also be opened directly through `index.html`, but the local server is better for PWA/service worker testing.

## Controls

- Mobile: use the on-screen buttons.
- Desktop general testing: arrow keys or WASD where movement is supported.
- Motocross: Left/Right or A/D steer, Up/W/Space gas, Shift/Enter/B trick or boost.
- Creature League map: arrow keys or WASD move Dad around the map.

If the browser shows an older version after changes, do a hard refresh or restart the local server. The service worker cache is versioned, but browsers can still hold onto old static files briefly.

## GitHub Desktop Workflow

After changes are committed locally:

1. Open GitHub Desktop.
2. Confirm the repository is `PythonProject2` / Dadventure.
3. Review any changed files.
4. Commit local changes if needed.
5. Click `Push origin` to upload them to the private GitHub repository.

For Adam to test from another computer, add him as a collaborator on the private repository. He can clone/download the repo and run the same local server command.

## Current Scope

- Pokemon-style intro with player name entry.
- Hub with six worlds in any order.
- Local progress saving.
- First playable motocross level with chase-style race view.
- First playable Creature League level.
- First playable Jedi, Destiny, and Deep Blue Fight levels.
- First playable Pixie Rescue level.
- Placeholder final letter ending with six-token gallery.

## Planning Files

- `PLAYTEST.md` has the manual test checklist.
- `CONTENT-TODO.md` lists personal details still worth collecting.
