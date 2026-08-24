# 1.5.1 Maintenance Baseline

## Current checked state

- Package version: 1.5.1
- Windows target: x64 portable
- Stable artifact: `Bible-Fighter-Windows-x64.exe`
- Runtime entry: `playtest.html`
- Desktop shell: Electron
- Runtime layers: game7 through game48 plus data/UI runtime modules
- Current showcase characters: David and Moses

## Required pre-release checks

- `npm run validate` passes without recursive script calls.
- All runtime scripts referenced by `playtest.html` exist locally.
- Electron preload and main process use the same application version marker.
- Windows EXE is produced with the stable artifact name.
- Packaged EXE smoke test starts the renderer successfully.
- Smoke test enters David vs Moses.
- Smoke test exercises at least one movement/attack input.
- Smoke diagnostics are uploaded even on failure.
- Release publication occurs only after smoke success.

## Known engineering constraint

The project has accumulated multiple incremental `gameXX.js` layers. These remain useful for reversible iteration but should not grow indefinitely. Version 1.6 is the transition point to a consolidated combat-core architecture.
