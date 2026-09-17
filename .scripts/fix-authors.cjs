// Author yml files in Docusaurus 3 reject empty strings in socials (string.empty).
// Drop `x: ''` and `linkedin: ''` (and any other empty strings under socials) so
// the field is simply absent instead of present-but-blank.
const fs = require('node:fs');
const path = require('node:path');
const YAML = require('yaml');

const ROOT = path.join('D:', 'github', 'top-project-trend', 'content');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/authors\.ya?ml$/i.test(e.name)) out.push(p);
  }
  return out;
}

let changed = 0;
for (const f of walk(ROOT)) {
  const src = fs.readFileSync(f, 'utf8');
  const parsed = YAML.parse(src);
  if (!parsed || typeof parsed !== 'object') continue;
  let dirty = false;
  for (const key of Object.keys(parsed)) {
    const author = parsed[key];
    if (author && author.socials && typeof author.socials === 'object') {
      for (const sKey of Object.keys(author.socials)) {
        const v = author.socials[sKey];
        if ((v === '' || v == null) && (sKey === 'x' || sKey === 'linkedin')) {
          delete author.socials[sKey];
          dirty = true;
        }
      }
    }
  }
  if (dirty) {
    fs.writeFileSync(f, YAML.stringify(parsed, { lineWidth: 0, defaultKeyType: 'PLAIN' }));
    changed++;
    console.log(`cleaned ${path.relative(ROOT, f)}`);
  }
}
console.log(`updated ${changed} file(s)`);
