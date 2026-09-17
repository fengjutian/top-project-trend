// Walks every content/* markdown file and applies pending schedule / unpublish
// changes whose `publish_at` or `unpublish_at` timestamp is in the past.

import {readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {extname, resolve} from 'node:path';
import type {Dirent} from 'node:fs';

const root = resolve('content');
const now = Date.now();
const changed: string[] = [];

function frontmatterValue(source: string, name: string): string {
  const match = source.match(new RegExp(`^${name}:\\s*(.+?)\\s*$`, 'm'));
  return match?.[1]?.replace(/^['"]|['"]$/g, '') || '';
}

function setField(source: string, name: string, value: string): string {
  const line = new RegExp(`^${name}:.*(?:\\r?\\n)?`, 'm');
  if (!value) return source.replace(line, '');
  if (line.test(source)) return source.replace(line, `${name}: ${value}\n`);
  return source.replace(/^---\r?\n/, `---\n${name}: ${value}\n`);
}

function due(value: string): boolean {
  if (!value) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && timestamp <= now;
}

function visit(directory: string): void {
  for (const entry of readdirSync(directory, {withFileTypes: true}) as Dirent[]) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      visit(path);
      continue;
    }
    if (!['.md', '.mdx'].includes(extname(entry.name).toLowerCase())) continue;

    const source = readFileSync(path, 'utf8');
    if (!source.startsWith('---')) continue;
    let output = source;
    const publishAt = frontmatterValue(output, 'publish_at');
    const unpublishAt = frontmatterValue(output, 'unpublish_at');

    if (due(publishAt)) {
      output = setField(output, 'draft', 'false');
      output = setField(output, 'publish_at', '');
    }
    if (due(unpublishAt)) {
      output = setField(output, 'draft', 'true');
      output = setField(output, 'unpublish_at', '');
    }
    if (output !== source) {
      writeFileSync(path, output);
      changed.push(path.slice(root.length + 1).replaceAll('\\', '/'));
    }
  }
}

visit(root);
console.log(changed.length ? `Updated scheduled articles:\n${changed.join('\n')}` : 'No scheduled article changes.');