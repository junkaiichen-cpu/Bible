import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const required = [
  'playtest.html',
  'style.css',
  'game7.js',
  'game8.js',
  'game9.js',
  'game10.js',
  'game11.js',
  'game12.js',
  'game13.js',
  'game14.js',
  'game15.js',
  'game19.js',
  'game8.css',
  'data/characters.js',
  'data/supports.js',
  'electron/main.cjs',
  'Playtest-Windows.bat'
];

const missing = required.filter((file) => !existsSync(file));
if (missing.length) {
  console.error('Missing required build files:\n' + missing.join('\n'));
  process.exit(1);
}

for (const file of ['game7.js', 'game8.js', 'game9.js', 'game10.js', 'game11.js', 'game12.js', 'game13.js', 'game14.js', 'game15.js', 'game19.js', 'electron/main.cjs']) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log('Build validation passed.');
