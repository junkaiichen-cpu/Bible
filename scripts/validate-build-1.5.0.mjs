import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const required=['playtest.html','game7.js','game46.js','game47.js','game48.js','electron/main.cjs','electron/preload-runtime.cjs','data/update.json','data/update-manifest.js'];
const fail=m=>{console.error(m);process.exit(1)};
for(const f of required)if(!existsSync(f))fail(`missing: ${f}`);
const pkg=JSON.parse(readFileSync('package.json','utf8'));
if(pkg.version!=='1.5.1')fail(`package version: ${pkg.version}`);
if(pkg.scripts?.['repair:source']!=='node scripts/repair-build-source.mjs')fail('repair:source script must invoke the repair module directly');
if(pkg.scripts?.['validate:source']!=='npm run repair:source && node scripts/validate-build-1.5.0.mjs')fail('validate:source script drift');
for(const f of ['game46.js','game47.js','game48.js','playtest.html','electron/**/*','data/**/*'])if(!pkg.build.files.includes(f))fail(`package omit: ${f}`);
const html=readFileSync('playtest.html','utf8');for(const f of ['game46.js','game47.js','game48.js'])if(!html.includes(`src=\"${f}\"`))fail(`runtime omit: ${f}`);
const main=readFileSync('electron/main.cjs','utf8');if(!main.includes('preload-runtime.cjs'))fail('Electron is not using runtime preload');
const preload=readFileSync('electron/preload-runtime.cjs','utf8');for(const m of ['1.5.1','game46.js','game47.js','game48.js'])if(!preload.includes(m))fail(`preload marker missing: ${m}`);
for(const [f,m] of [['game46.js','BIBLE_FIGHTER_COMBAT_CORE_READY'],['game47.js','BIBLE_FIGHTER_VERTICAL_SLICE_READY'],['game48.js','BIBLE_FIGHTER_RUNTIME_POLISH_READY']])if(!readFileSync(f,'utf8').includes(m))fail(`${f} marker missing`);
if(!readFileSync('data/update.json','utf8').includes('1.5.1'))fail('update version');
if(!readFileSync('data/update.json','utf8').includes('/releases/latest/download/Bible-Fighter-Windows-x64.exe'))fail('stable download URL');
for(const f of ['game7.js','game46.js','game47.js','game48.js','electron/main.cjs','electron/preload-runtime.cjs']){const r=spawnSync(process.execPath,['--check',f],{stdio:'inherit'});if(r.status!==0)process.exit(r.status??1)}
console.log('1.5.1 stability/performance build validation passed');
