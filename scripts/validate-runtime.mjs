import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const fail = (message) => {
  console.error(`Runtime validation failed: ${message}`);
  process.exit(1);
};

const htmlPath = resolve(root, 'playtest.html');
if (!existsSync(htmlPath)) fail('playtest.html is missing');

const html = readFileSync(htmlPath, 'utf8');
const scripts = [...html.matchAll(/<script\s+src=["']([^"']+)["'][^>]*><\/script>/gi)].map((m) => m[1]);
if (!scripts.length) fail('no external scripts found in playtest.html');

const expectedFirst = ['data/characters.js', 'data/supports.js', 'game7.js'];
for (const name of expectedFirst) {
  if (!scripts.includes(name)) fail(`missing required runtime script: ${name}`);
}

const baseIndex = scripts.indexOf('game7.js');
const characterIndex = scripts.indexOf('data/characters.js');
const supportIndex = scripts.indexOf('data/supports.js');
if (characterIndex > baseIndex || supportIndex > baseIndex) {
  fail('character/support data must load before the combat engine');
}

for (const src of scripts) {
  if (/^https?:\/\//i.test(src) || src.startsWith('//')) fail(`remote runtime dependency is not allowed: ${src}`);
  if (!existsSync(resolve(root, src))) fail(`script referenced by playtest.html does not exist: ${src}`);
}

for (const marker of ['id="selectScreen"', 'id="battleScreen"', 'id="game"', 'id="startBtn"']) {
  if (!html.includes(marker)) fail(`missing required UI marker: ${marker}`);
}

const game19 = readFileSync(resolve(root, 'game19.js'), 'utf8');
if (!game19.includes('game20.js') || !game19.includes('game20.css') || !game19.includes('BIBLE_FIGHTER_HUD_READY')) {
  fail('game19.js is not wired to dynamically load the combat HUD layer');
}
if (!existsSync(resolve(root, 'game20.js')) || !existsSync(resolve(root, 'game20.css'))) {
  fail('combat HUD assets are missing');
}

const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const buildFiles = packageJson.build?.files ?? [];
for (const required of ['playtest.html', 'game20.js', 'game20.css', 'data/**/*', 'electron/**/*']) {
  if (!buildFiles.includes(required)) fail(`electron-builder package files omit ${required}`);
}

console.log(`Runtime validation passed: ${scripts.length} entry scripts, dynamically loaded combat HUD intact.`);
