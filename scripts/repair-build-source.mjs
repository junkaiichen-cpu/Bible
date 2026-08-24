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
  console.log(`Repaired ${target}: refreshSelect statement terminator.`);
} else if (original.includes(fixed)) {
  console.log(`${target} already repaired.`);
} else {
  console.error(`Expected repair target not found in ${target}. Refusing to continue.`);
  process.exit(1);
}
