import {readdirSync, readFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {extname, resolve} from 'node:path';

const root = resolve('content');
const outputPath = resolve('static', 'reports', 'link-report.json');
const links = new Map();
const concurrency = 8;

function visit(directory) {
  for (const entry of readdirSync(directory, {withFileTypes: true})) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) visit(path);
    else if (['.md', '.mdx'].includes(extname(entry.name).toLowerCase())) {
      const source = readFileSync(path, 'utf8');
      for (const match of source.matchAll(/https?:\/\/[^\s)>'"}]+/g)) {
        const url = match[0].replace(/[.,;:]$/, '');
        links.set(url, [...(links.get(url) || []), path.slice(root.length + 1).replaceAll('\\', '/')]);
      }
    }
  }
}

async function check([url, files]) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  const startedAt = Date.now();
  try {
    let response = await fetch(url, {method: 'HEAD', redirect: 'follow', signal: controller.signal, headers: {'User-Agent': 'top-project-trend-link-audit'}});
    if ([403, 405, 429].includes(response.status)) {
      response = await fetch(url, {method: 'GET', redirect: 'follow', signal: controller.signal, headers: {'User-Agent': 'top-project-trend-link-audit', Range: 'bytes=0-1024'}});
    }
    return {url, files: [...new Set(files)], status: response.status, ok: response.ok || [401, 403, 429].includes(response.status), durationMs: Date.now() - startedAt};
  } catch (error) {
    return {url, files: [...new Set(files)], status: 0, ok: false, error: error.name === 'AbortError' ? 'timeout' : error.message, durationMs: Date.now() - startedAt};
  } finally {
    clearTimeout(timeout);
  }
}

visit(root);
const queue = [...links.entries()];
const results = [];
async function worker() {
  while (queue.length) results.push(await check(queue.shift()));
}
await Promise.all(Array.from({length: Math.min(concurrency, queue.length)}, worker));
results.sort((a, b) => Number(a.ok) - Number(b.ok) || a.url.localeCompare(b.url));
const report = {
  generatedAt: new Date().toISOString(),
  total: results.length,
  healthy: results.filter((item) => item.ok).length,
  broken: results.filter((item) => !item.ok).length,
  links: results,
};
mkdirSync(resolve('static', 'reports'), {recursive: true});
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Checked ${report.total} links: ${report.healthy} healthy, ${report.broken} broken.`);
process.exitCode = report.broken ? 1 : 0;
