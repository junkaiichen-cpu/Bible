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

const expectedRuntime = [
  'data/characters.js', 'data/supports.js', 'data/missions.js', 'game7.js', 'game19.js', 'game20.js', 'game21.js'
];
for (const name of expectedRuntime) {
  if (!scripts.includes(name)) fail(`missing required runtime script: ${name}`);
}

const baseIndex = scripts.indexOf('game7.js');
const characterIndex = scripts.indexOf('data/characters.js');
const supportIndex = scripts.indexOf('data/supports.js');
const missionIndex = scripts.indexOf('data/missions.js');
if (characterIndex > baseIndex || supportIndex > baseIndex || missionIndex > baseIndex) {
  fail('character/support/mission data must load before the combat engine');
}
if (!(scripts.indexOf('game20.js') > scripts.indexOf('game19.js')) || !(scripts.indexOf('game21.js') > scripts.indexOf('game20.js'))) {
  fail('combat HUD layers must load after the base diagnostic layer');
}

const styles = [...html.matchAll(/<link\s+rel=["']stylesheet["']\s+href=["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]);
for (const name of ['game20.css', 'game21.css']) {
  if (!styles.includes(name)) fail(`missing required stylesheet: ${name}`);
}

for (const src of scripts) {
  if (/^https?:\/\//i.test(src) || src.startsWith('//')) fail(`remote runtime dependency is not allowed: ${src}`);
  if (!existsSync(resolve(root, src))) fail(`script referenced by playtest.html does not exist: ${src}`);
}
for (const src of styles) {
  if (/^https?:\/\//i.test(src) || src.startsWith('//')) fail(`remote stylesheet dependency is not allowed: ${src}`);
  if (!existsSync(resolve(root, src))) fail(`stylesheet referenced by playtest.html does not exist: ${src}`);
}

for (const marker of ['id="selectScreen"', 'id="battleScreen"', 'id="game"', 'id="startBtn"']) {
  if (!html.includes(marker)) fail(`missing required UI marker: ${marker}`);
}

const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const buildFiles = packageJson.build?.files ?? [];
for (const required of ['playtest.html', 'game20.js', 'game21.js', 'game20.css', 'game21.css', 'data/**/*', 'electron/**/*']) {
  if (!buildFiles.includes(required)) fail(`electron-builder package files omit ${required}`);
}

console.log(`Runtime validation passed: ${scripts.length} scripts + ${styles.length} stylesheets, combat HUD entry intact.`);
