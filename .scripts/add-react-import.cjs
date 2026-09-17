// One-shot: prepend `import React from 'react';` to every .tsx/.ts under src/admin/*
// that doesn't already import from 'react'. Idempotent.
const fs = require('node:fs');
const path = require('node:path');

const root = path.join('D:', 'github', 'top-project-trend', 'src', 'admin');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.(t|j)sx?$/.test(entry.name)) out.push(p);
  }
  return out;
}

const files = walk(root);
let changed = 0;
for (const f of files) {
  let src = fs.readFileSync(f, 'utf8');
  if (src.match(/from\s+['"]react['"]/)) continue;
  // skip purely-type files (no JSX)
  if (!src.includes('<')) continue;
  // find first import line; insert before it. If no imports, insert after leading comments.
  const lines = src.split(/\r?\n/);
  let idx = lines.findIndex((l) => /^import\s/.test(l));
  if (idx === -1) {
    idx = lines.findIndex((l) => /\S/.test(l) && !/^\s*(\/\/|\/\*|\*)/.test(l));
  }
  const inject = "import React from 'react';";
  if (lines.includes(inject)) continue;
  lines.splice(idx === -1 ? 0 : idx, 0, inject);
  fs.writeFileSync(f, lines.join('\r\n'));
  changed++;
}
console.log(`updated ${changed} file(s)`);
