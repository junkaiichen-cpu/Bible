# Bible Fighter 1.0.0 Release Contract

## Windows release gate

- `npm run validate` passes.
- Every script referenced by `playtest.html` exists and is local.
- Character and support data load before the combat engine.
- Electron package includes the playable entry and all runtime layers.
- Windows x64 portable `.exe` is produced.
- Packaged executable starts successfully under `BIBLE_FIGHTER_SMOKE=1`.
- Renderer runtime probe confirms the canvas, selection screen, battle screen, roster, and support data.
- Renderer errors fail the build; Chromium warnings do not.
- Published executable is attached to a GitHub Release only after smoke test success.

## Gameplay quality gate

- 5A attack chain remains deterministic at 60 FPS.
- Skill cancel windows do not bypass cooldowns or invulnerability rules.
- Substitution remains a defensive resource, not a free teleport.
- Hit-stop and camera feedback scale with impact severity.
- Character-specific combat layers do not alter canonical Bible facts.
- A new character must ship with a defined identity, neutral plan, pressure plan, defensive answer, and signature finisher.

## Product rule

Prefer small, reversible combat-layer changes with explicit validation over large rewrites of the live battle engine.
