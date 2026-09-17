// Walks every content/* markdown file, collects every external http(s) link,
// HEAD-checks them concurrently, and writes a JSON report to
// static/reports/link-report.json.

import {mkdirSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {extname, resolve} from 'node:path';
import type {Dirent} from 'node:fs';

const root = resolve('content');
const outputPath = resolve('static', 'reports', 'link-report.json');
const links = new Map<string, string[]>();
const concurrency = 8;

interface CheckResult {
  url: string;
  files: string[];
  status: number;
  ok: boolean;
  durationMs: number;
  error?: string;
}

function visit(directory: string): void {
  for (const entry of readdirSync(directory, {withFileTypes: true}) as Dirent[]) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) visit(path);
    else if (['.md', '.mdx'].includes(extname(entry.name).toLowerCase())) {
      const source = readFileSync(path, 'utf8');
      for (const match of source.matchAll(/https?:\/\/[^\s)>'"}]+/g)) {
        const url = match[0].replace(/[.,;:]$/, '');
        const existing = links.get(url) ?? [];
        existing.push(path.slice(root.length + 1).replaceAll('\\', '/'));
        links.set(url, existing);
      }
    }
  }
}

async function check(entry: [string, string[]]): Promise<CheckResult> {
  const [url, files] = entry;
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
    const e = error as Error;
    return {url, files: [...new Set(files)], status: 0, ok: false, error: e.name === 'AbortError' ? 'timeout' : e.message, durationMs: Date.now() - startedAt};
  } finally {
    clearTimeout(timeout);
  }
}

visit(root);
const queue: Array<[string, string[]]> = [...links.entries()];
const results: CheckResult[] = [];
async function worker(): Promise<void> {
  while (queue.length) {
    const item = queue.shift();
    if (item) results.push(await check(item));
  }
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