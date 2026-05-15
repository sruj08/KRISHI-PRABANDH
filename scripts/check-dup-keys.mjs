import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const target = path.resolve(__dirname, '..', 'frontend', 'src', 'utils', 'translations.js');
const file = fs.readFileSync(target, 'utf8');
const lines = file.split('\n');
const seen = new Map();
const dupes = new Map();
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^\s+"([^"\\]+)":\s*\{/);
  if (!m) continue;
  const key = m[1];
  if (seen.has(key)) {
    if (!dupes.has(key)) dupes.set(key, [seen.get(key)]);
    dupes.get(key).push(i + 1);
  } else {
    seen.set(key, i + 1);
  }
}
console.log(`Total entries: ${seen.size}`);
console.log(`Duplicate keys: ${dupes.size}`);
for (const [key, ls] of dupes) {
  console.log(`  ${JSON.stringify(key)} at lines ${ls.join(', ')}`);
}
