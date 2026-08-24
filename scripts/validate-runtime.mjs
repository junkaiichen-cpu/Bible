import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = process.cwd();
const fail = (message) => { console.error(`Runtime validation failed: ${message}`); process.exit(1); };
const htmlPath = resolve(root,'playtest.html');
if (!existsSync(htmlPath)) fail('playtest.html is missing');
const html = readFileSync(htmlPath,'utf8');
const scripts = [...html.matchAll(/<script\s+src=["']([^"']+)["'][^>]*><\/script>/gi)].map((m)=>m[1]);
const expectedRuntime = ['data/characters.js','data/supports.js','data/missions.js','data/codex.js','game7.js','game19.js','game20.js','game21.js','game22.js','game23.js','game24.js','game25.js','game26.js','game27.js','game28.js','game29.js','game30.js','game31.js','game32.js'];
for (const name of expectedRuntime) if (!scripts.includes(name)) fail(`missing required runtime script: ${name}`);
const baseIndex = scripts.indexOf('game7.js');
for (const name of ['data/characters.js','data/supports.js','data/missions.js','data/codex.js']) if (scripts.indexOf(name) > baseIndex) fail(`${name} must load before the combat engine`);
for (let i = 20; i <= 32; i++) { if (!(scripts.indexOf(`game${i}.js`) > scripts.indexOf(`game${i-1}.js`))) fail(`combat layer order invalid at game${i}.js`); }
const styles = [...html.matchAll(/<link\s+rel=["']stylesheet["']\s+href=["']([^"']+)["'][^>]*>/gi)].map((m)=>m[1]);
for (const name of ['game20.css','game21.css','game22.css','game23.css']) if (!styles.includes(name)) fail(`missing required stylesheet: ${name}`);
for (const src of scripts) { if (/^https?:\/\//i.test(src) || src.startsWith('//')) fail(`remote runtime dependency is not allowed: ${src}`); if (!existsSync(resolve(root,src))) fail(`script referenced by playtest.html does not exist: ${src}`); }
for (const src of styles) { if (/^https?:\/\//i.test(src) || src.startsWith('//')) fail(`remote stylesheet dependency is not allowed: ${src}`); if (!existsSync(resolve(root,src))) fail(`stylesheet referenced by playtest.html does not exist: ${src}`); }
for (const marker of ['id="selectScreen"','id="battleScreen"','id="game"','id="startBtn"']) if (!html.includes(marker)) fail(`missing required UI marker: ${marker}`);
const packageJson = JSON.parse(readFileSync(resolve(root,'package.json'),'utf8')); const buildFiles = packageJson.build?.files ?? [];
for (const required of ['playtest.html','game20.js','game21.js','game22.js','game23.js','game24.js','game25.js','game26.js','game27.js','game28.js','game29.js','game30.js','game31.js','game32.js','game20.css','game21.css','game22.css','game23.css','data/**/*','electron/**/*']) if (!buildFiles.includes(required)) fail(`electron-builder package files omit ${required}`);
for (const [file, marker, label] of [
  ['game23.js','BIBLE_FIGHTER_BRIEFING_READY','battle briefing'],
  ['game24.js','BIBLE_FIGHTER_COMBAT_FRAMES_READY','combat frame'],
  ['game25.js','BIBLE_FIGHTER_FRAME_RULES_READY','enforced frame'],
  ['game26.js','BIBLE_FIGHTER_DAVID_ART_READY','David art'],
  ['game27.js','BIBLE_FIGHTER_DAVID_IMPACT_READY','David impact'],
  ['game28.js','BIBLE_FIGHTER_MULTIPLAYER_READY','local multiplayer'],
  ['game29.js','BIBLE_FIGHTER_STAGE_READY','2D stage'],
  ['game30.js','BIBLE_FIGHTER_CORE_CHARACTERS_READY','production David/Moses fighters'],
  ['game31.js','BIBLE_FIGHTER_READABILITY_READY','combat readability'],
  ['game32.js','BIBLE_FIGHTER_STABILITY_READY','combat stability']
]) if (!readFileSync(resolve(root,file),'utf8').includes(marker)) fail(`${label} runtime marker missing`);
const stageSource = readFileSync(resolve(root,'game29.js'),'utf8');
for (const marker of ['elah-valley','red-sea','2.2-2d-stage']) if (!stageSource.includes(marker)) fail(`2D stage mode marker missing: ${marker}`);
const fighters = readFileSync(resolve(root,'game30.js'),'utf8');
for (const marker of ['david','moses','local2p']) if (!fighters.includes(marker)) fail(`production fighter marker missing: ${marker}`);
console.log(`Runtime validation passed: ${scripts.length} scripts + ${styles.length} stylesheets, local 2P + David/Moses + 2D stages + readability + stability layers intact.`);
