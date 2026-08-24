import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const required = ['playtest.html','style.css','game7.js','game8.js','game9.js','game10.js','game11.js','game12.js','game13.js','game14.js','game15.js','game19.js','game20.js','game21.js','game22.js','game23.js','game24.js','game25.js','game26.js','game27.js','game28.js','game29.js','game30.js','game31.js','game32.js','game33.js','game8.css','game20.css','game21.css','game22.css','game23.css','data/characters.js','data/supports.js','data/missions.js','data/codex.js','electron/main.cjs','Playtest-Windows.bat'];
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
for (const marker of ['BIBLE_FIGHTER_FRAME_RULES_READY','frame-runtime-v1','BIBLE_FIGHTER_FRAME_RULES']) if (!readFileSync('game25.js','utf8').includes(marker)) { console.error(`Build validation failed: game25.js missing enforced frame marker: ${marker}`); process.exit(1); }
for (const marker of ['BIBLE_FIGHTER_DAVID_ART_READY','davidFx','Valley of Elah']) if (!readFileSync('game26.js','utf8').includes(marker)) { console.error(`Build validation failed: game26.js missing David art marker: ${marker}`); process.exit(1); }
for (const marker of ['BIBLE_FIGHTER_DAVID_IMPACT_READY','davidImpact','守住阵线']) if (!readFileSync('game27.js','utf8').includes(marker)) { console.error(`Build validation failed: game27.js missing David impact marker: ${marker}`); process.exit(1); }
for (const marker of ['BIBLE_FIGHTER_MULTIPLAYER_READY','BIBLE_FIGHTER_MULTIPLAYER','local-2p']) if (!readFileSync('game28.js','utf8').includes(marker)) { console.error(`Build validation failed: game28.js missing local multiplayer marker: ${marker}`); process.exit(1); }
for (const marker of ['BIBLE_FIGHTER_STAGE_READY','BIBLE_FIGHTER_STAGE','red-sea','elah-valley','2.2-2d-stage']) if (!readFileSync('game29.js','utf8').includes(marker)) { console.error(`Build validation failed: game29.js missing required 2D stage marker: ${marker}`); process.exit(1); }
for (const marker of ['BIBLE_FIGHTER_CORE_CHARACTERS_READY','BIBLE_FIGHTER_CORE_CHARACTERS','david','moses']) if (!readFileSync('game30.js','utf8').includes(marker)) { console.error(`Build validation failed: game30.js missing core fighter marker: ${marker}`); process.exit(1); }
if (!readFileSync('game31.js','utf8').includes('BIBLE_FIGHTER_READABILITY_READY')) { console.error('Build validation failed: readability runtime marker missing.'); process.exit(1); }
for (const marker of ['BIBLE_FIGHTER_STABILITY_READY','BIBLE_FIGHTER_TRIGGER_HITSTOP','bounds','separation']) if (!readFileSync('game32.js','utf8').includes(marker)) { console.error(`Build validation failed: stability marker missing: ${marker}`); process.exit(1); }
for (const marker of ['BIBLE_FIGHTER_MATCH_READY','BIBLE_FIGHTER_RESET_INPUT','BIBLE_FIGHTER_MATCH_SYNC','epoch']) if (!readFileSync('game33.js','utf8').includes(marker)) { console.error(`Build validation failed: match lifecycle marker missing: ${marker}`); process.exit(1); }

for (const file of ['game7.js','game8.js','game9.js','game10.js','game11.js','game12.js','game13.js','game14.js','game15.js','game19.js','game20.js','game21.js','game22.js','game23.js','game24.js','game25.js','game26.js','game27.js','game28.js','game29.js','game30.js','game31.js','game32.js','game33.js','electron/main.cjs']) {
  const result = spawnSync(process.execPath,['--check',file],{stdio:'inherit'});
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log('Build validation passed: combat runtime + HUD + identity + codex + briefing + frame rules + David art/impact + local 2P + 2D stages + production fighters + readability + stability + match lifecycle present.');
