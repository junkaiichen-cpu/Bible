import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const required=['playtest.html','game7.js','game46.js','game47.js','electron/main.cjs','electron/preload.cjs','data/update.json','data/update-manifest.js'];
const fail=m=>{console.error(m);process.exit(1)};
for(const f of required)if(!existsSync(f))fail(`missing: ${f}`);
const pkg=JSON.parse(readFileSync('package.json','utf8'));if(pkg.version!=='1.5.0')fail(`package version: ${pkg.version}`);for(const f of ['game46.js','game47.js','playtest.html','electron/**/*','data/**/*'])if(!pkg.build.files.includes(f))fail(`package omit: ${f}`);
const html=readFileSync('playtest.html','utf8');for(const f of ['game46.js','game47.js'])if(!html.includes(`src="${f}"`))fail(`runtime omit: ${f}`);
for(const [f,m] of [['game46.js','BIBLE_FIGHTER_COMBAT_CORE_READY'],['game47.js','BIBLE_FIGHTER_VERTICAL_SLICE_READY']])if(!readFileSync(f,'utf8').includes(m))fail(`${f} marker missing`);
if(!readFileSync('data/update.json','utf8').includes('1.5.0'))fail('update version');
for(const f of ['game7.js','game46.js','game47.js','electron/main.cjs','electron/preload.cjs']){const r=spawnSync(process.execPath,['--check',f],{stdio:'inherit'});if(r.status!==0)process.exit(r.status??1)}
console.log('1.5.0 vertical slice build validation passed');
