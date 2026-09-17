import {createHash} from 'node:crypto';
import {readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {extname, relative, resolve, sep} from 'node:path';
import {spawnSync} from 'node:child_process';

const root = resolve(new URL('..', import.meta.url).pathname.replace(/^\/(.:)/, '$1'));
const strict = process.argv.includes('--strict');
const writeManifest = process.argv.includes('--write-manifest');
const mediaExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.mp4', '.webm', '.svg']);
const textExtensions = new Set(['.md', '.mdx', '.js', '.jsx', '.ts', '.tsx', '.css', '.json']);
const ignored = new Set(['.git', 'node_modules', 'build', '.docusaurus', '.cache-loader']);

function walk(directory, predicate, files = []) {
  for (const entry of readdirSync(directory, {withFileTypes: true})) {
    if (ignored.has(entry.name)) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) walk(path, predicate, files);
    else if (predicate(path)) files.push(path);
  }
  return files;
}

function dimensions(path) {
  if (extname(path).toLowerCase() === '.svg') return {};
  const result = spawnSync('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height', '-of', 'json', path,
  ], {encoding: 'utf8'});
  if (result.status !== 0) return {};
  const stream = JSON.parse(result.stdout).streams?.[0] ?? {};
  return {width: stream.width, height: stream.height};
}

const media = walk(root, (path) => mediaExtensions.has(extname(path).toLowerCase()));
const text = walk(root, (path) => textExtensions.has(extname(path).toLowerCase()))
  .map((path) => readFileSync(path, 'utf8')).join('\n');
const hashes = new Map();
const records = [];

for (const path of media) {
  const buffer = readFileSync(path);
  const hash = createHash('sha256').update(buffer).digest('hex');
  const info = statSync(path);
  const ext = extname(path).toLowerCase();
  const item = {
    path: relative(root, path).split(sep).join('/'),
    size: info.size,
    hash,
    referenced: text.includes(relative(root, path).split(sep).join('/')) || text.includes(path.split(sep).pop()),
    ...dimensions(path),
  };
  records.push(item);
  hashes.set(hash, [...(hashes.get(hash) ?? []), item.path]);
}

const oversized = records.filter((item) =>
  (item.path.endsWith('.mp4') && item.size > 3 * 1024 * 1024) ||
  (!item.path.endsWith('.mp4') && item.size > 200 * 1024));
const tooWide = records.filter((item) => item.width > 2560);
const unreferenced = records.filter((item) => !item.referenced);
const duplicates = [...hashes.values()].filter((paths) => paths.length > 1);

console.log(`Media: ${records.length}`);
console.log(`Size: ${(records.reduce((sum, item) => sum + item.size, 0) / 1024 / 1024).toFixed(2)} MB`);
console.log(`Oversized: ${oversized.length}`);
console.log(`Over 2560px wide: ${tooWide.length}`);
console.log(`Possibly unreferenced: ${unreferenced.length}`);
console.log(`Duplicate groups: ${duplicates.length}`);

for (const item of oversized.slice(0, 20)) console.log(`  SIZE ${item.path} (${Math.round(item.size / 1024)} KB)`);
for (const item of tooWide.slice(0, 20)) console.log(`  WIDTH ${item.path} (${item.width}x${item.height})`);
for (const paths of duplicates.slice(0, 10)) console.log(`  DUPLICATE ${paths.join(' | ')}`);

if (writeManifest) {
  const manifestPath = resolve(root, 'static', 'media-manifest.json');
  writeFileSync(manifestPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    summary: {
      total: records.length,
      size: records.reduce((sum, item) => sum + item.size, 0),
      oversized: oversized.length,
      tooWide: tooWide.length,
      unreferenced: unreferenced.length,
      duplicateGroups: duplicates.length,
    },
    duplicates,
    media: records,
  }, null, 2)}\n`);
  console.log(`Manifest: ${relative(root, manifestPath)}`);
}

if (strict && (oversized.length || tooWide.length)) process.exitCode = 1;
