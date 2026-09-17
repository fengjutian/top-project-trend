// Adds an explicit `date:` field to every content/* markdown file that has a
// YYYYMMDD-style filename prefix but is missing the date front matter entry.

import {readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {extname, resolve} from 'node:path';
import type {Dirent} from 'node:fs';

const contentRoot = resolve('content');
const ARTICLE_EXTENSIONS = new Set(['.md', '.mdx']);
let updated = 0;

function visit(directory: string): void {
  for (const entry of readdirSync(directory, {withFileTypes: true}) as Dirent[]) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      visit(path);
      continue;
    }
    if (!ARTICLE_EXTENSIONS.has(extname(entry.name).toLowerCase())) continue;

    const match = entry.name.match(/^(\d{4})-?(\d{2})-?(\d{2})/);
    if (!match) continue;

    const source = readFileSync(path, 'utf8');
    if (!source.startsWith('---') || /^date:/m.test(source)) continue;

    const newline = source.startsWith('---\r\n') ? '\r\n' : '\n';
    const date = `${match[1]}-${match[2]}-${match[3]}`;
    const output = source.replace(`---${newline}`, `---${newline}date: ${date}${newline}`);
    writeFileSync(path, output);
    updated += 1;
  }
}

visit(contentRoot);
console.log(`Added explicit dates to ${updated} article(s).`);