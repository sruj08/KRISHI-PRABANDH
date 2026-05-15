// Remove duplicate keys from translations.js, keeping the FIRST occurrence
// to preserve hand-curated original translations.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const target = path.resolve(__dirname, '..', 'frontend', 'src', 'utils', 'translations.js');
const file = fs.readFileSync(target, 'utf8');
const lines = file.split('\n');

const seen = new Set();
const out = [];
let removed = 0;
const removedKeys = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const m = line.match(/^(\s+)"((?:[^"\\]|\\.)+)":\s*\{[^}]*\}\s*,?\s*$/);
  if (m) {
    const key = m[2];
    if (seen.has(key)) {
      removed++;
      removedKeys.push(key);
      continue; // drop this line
    }
    seen.add(key);
  }
  out.push(line);
}

fs.writeFileSync(target, out.join('\n'), 'utf8');
console.log(`Removed ${removed} duplicate key lines.`);
console.log(`Kept ${seen.size} unique keys.`);
if (removedKeys.length) {
  console.log('Duplicate keys removed (later occurrences):');
  for (const k of removedKeys) console.log('  - ' + JSON.stringify(k));
}
