import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const target = 'game7.js';
if (!existsSync(target)) {
  console.error(`Missing ${target}`);
  process.exit(1);
}

const original = readFileSync(target, 'utf8');
const broken = "})$(s+'Label')";
const fixed = "});$(s+'Label')";

if (original.includes(broken)) {
  writeFileSync(target, original.replace(broken, fixed), 'utf8');
  console.log(`Repaired ${target}: legacy refreshSelect statement terminator.`);
} else if (original.includes(fixed)) {
  console.log(`${target} legacy refreshSelect syntax already repaired.`);
} else if (original.includes('window.BIBLE_FIGHTER_SELECTION_READY') && original.includes('window.start') && original.includes('window.attack')) {
  console.log(`${target} uses canonical combat runtime; no legacy repair required.`);
} else {
  console.error(`Expected combat runtime markers not found in ${target}. Refusing to continue.`);
  process.exit(1);
}
