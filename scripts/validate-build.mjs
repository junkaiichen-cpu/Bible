import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const required = ['playtest.html','style.css','game7.js','game8.js','game9.js','game10.js','game11.js','game12.js','game13.js','game14.js','game15.js','game19.js','game20.js','game21.js','game22.js','game23.js','game24.js','game8.css','game20.css','game21.css','game22.css','game23.css','data/characters.js','data/supports.js','data/missions.js','data/codex.js','electron/main.cjs','Playtest-Windows.bat'];
const missing = required.filter((file) => !existsSync(file));
if (missing.length) { console.error('Missing required build files:\n' + missing.join('\n')); process.exit(1); }

const game7 = readFileSync('game7.js','utf8');
if (game7.trim().length < 2000) { console.error('Build validation failed: game7.js is unexpectedly small or empty.'); process.exit(1); }
for (const marker of ['window.BIBLE_FIGHTER_SELECTION_READY','window.refreshSelect','window.start','window.attack','window.update','window.drawFx']) if (!game7.includes(marker)) { console.error(`Build validation failed: game7.js missing canonical runtime marker: ${marker}`); process.exit(1); }
for (const marker of ['combat-ui','mission-panel','skill-deck','battle-map']) if (!readFileSync('game20.js','utf8').includes(marker)) { console.error(`Build validation failed: game20.js missing HUD marker: ${marker}`); process.exit(1); }
for (const marker of ['combat-identity-layer','mission-reward','identity-status']) if (!readFileSync('game21.js','utf8').includes(marker)) { console.error(`Build validation failed: game21.js missing identity marker: ${marker}`); process.exit(1); }
for (const marker of ['BIBLE_FIGHTER_CODEX_READY','BIBLE_FIGHTER_CODEX_UNLOCKED','bible-fighter-codex-v1']) if (!readFileSync('game22.js','utf8').includes(marker)) { console.error(`Build validation failed: game22.js missing codex marker: ${marker}`); process.exit(1); }
for (const marker of ['BIBLE_FIGHTER_BRIEFING_READY','battle-briefing-layer']) if (!readFileSync('game23.js','utf8').includes(marker)) { console.error(`Build validation failed: game23.js missing briefing marker: ${marker}`); process.exit(1); }
for (const marker of ['BIBLE_FIGHTER_COMBAT_FRAMES_READY','BIBLE_MOVE_DATA','movePhase','juggleProtect']) if (!readFileSync('game24.js','utf8').includes(marker)) { console.error(`Build validation failed: game24.js missing combat frame marker: ${marker}`); process.exit(1); }

for (const file of ['game7.js','game8.js','game9.js','game10.js','game11.js','game12.js','game13.js','game14.js','game15.js','game19.js','game20.js','game21.js','game22.js','game23.js','game24.js','electron/main.cjs']) {
  const result = spawnSync(process.execPath,['--check',file],{stdio:'inherit'});
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log('Build validation passed: combat runtime + HUD + identity + codex + briefing + frame layers present.');
