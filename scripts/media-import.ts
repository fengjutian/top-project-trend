// Imports an image or video into static/media/<section>/<year>/<article>/,
// transcodes it (WebP for images, MP4/H.264 for video) and prints a Markdown
// snippet ready to paste into an article.

import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, renameSync} from 'node:fs';
import {basename, extname, join, relative, resolve, sep} from 'node:path';
import {spawnSync} from 'node:child_process';

const root = resolve(new URL('..', import.meta.url).pathname.replace(/^\/(.:)/, '$1'));
const args = process.argv.slice(2);

function option(name: string, fallback: string | undefined): string | undefined {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : fallback;
}

function slug(value: string): string {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'media';
}

function run(command: string, commandArgs: readonly string[]): void {
  const result = spawnSync(command, commandArgs, {stdio: 'inherit'});
  const err = result.error as NodeJS.ErrnoException | undefined;
  if (err?.code === 'ENOENT') {
    throw new Error(`${command} is required but was not found in PATH.`);
  }
  if (result.status !== 0) throw new Error(`${command} exited with ${result.status}.`);
}

const inputArg = args.find((arg) => !arg.startsWith('--') && !args[args.indexOf(arg) - 1]?.startsWith('--'));
const article = option('article', undefined);
const section = slug(option('section', 'blog') ?? 'blog');
const year = option('year', String(new Date().getFullYear())) ?? String(new Date().getFullYear());
const purpose = slug(option('purpose', 'image') ?? 'image');

if (!inputArg || !article) {
  console.error('Usage: pnpm media:import <file> --article <slug> [--section blog] [--year 2026] [--purpose cover]');
  process.exit(1);
}

const input = resolve(process.cwd(), inputArg);
if (!existsSync(input)) throw new Error(`Input not found: ${input}`);

const sourceExt = extname(input).toLowerCase();
const video = ['.gif', '.mp4', '.mov', '.webm'].includes(sourceExt);
const image = ['.png', '.jpg', '.jpeg', '.webp'].includes(sourceExt);
if (!video && !image) throw new Error(`Unsupported media type: ${sourceExt}`);

const destination = join(root, 'static', 'media', section, year, slug(article));
mkdirSync(destination, {recursive: true});

const outputExt = video ? '.mp4' : '.webp';
const temporary = join(destination, `.media-import-${process.pid}${outputExt}`);

try {
  if (video) {
    run('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-y', '-i', input, '-an',
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '27', '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart', '-vf', "scale='min(1920,iw)':-2", temporary,
    ]);
  } else {
    run('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-y', '-i', input,
      '-c:v', 'libwebp', '-quality', '82', '-compression_level', '6',
      '-preset', 'picture', '-vf', "scale='min(2560,iw)':-2", temporary,
    ]);
  }

  const hash = createHash('sha256').update(readFileSync(temporary)).digest('hex').slice(0, 8);
  const originalName = slug(basename(input, sourceExt));
  const filename = `${originalName}-${purpose}-${hash}${outputExt}`;
  const finalPath = join(destination, filename);

  if (existsSync(finalPath)) {
    spawnSync('rm', [temporary]);
  } else {
    renameSync(temporary, finalPath);
  }

  const publicPath = `/${relative(join(root, 'static'), finalPath).split(sep).join('/')}`;
  console.log(`Imported: ${relative(root, finalPath)}`);
  console.log(video
    ? `<OptimizedVideo src="${publicPath}" />`
    : `![${originalName}](${publicPath})`);
} finally {
  if (existsSync(temporary)) spawnSync('rm', [temporary]);
}