import {existsSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const sections = new Set([
  'blog', 'algorithm', 'android', 'code', 'golang', 'java', 'lang-chain',
  'llm', 'mcp', 'python', 'rust', 'static-website', 'ts',
]);
const [section, ...titleParts] = process.argv.slice(2);
const title = titleParts.join(' ').trim();

if (!sections.has(section) || !title) {
  console.error('Usage: pnpm article:new <section> <title>');
  console.error(`Sections: ${[...sections].join(', ')}`);
  process.exit(1);
}

const slug = title
  .normalize('NFKD')
  .toLowerCase()
  .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
  .replace(/^-|-$/g, '') || 'new-article';
const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
const filename = `${date}-${slug}-blog.md`;
const path = resolve('content', section, filename);

if (existsSync(path)) throw new Error(`Article already exists: ${path}`);

writeFileSync(path, `---
slug: ${slug}
title: ${title}
authors: fengjutian
tags: []
---

在这里开始写文章。
`);

console.log(`Created: ${path}`);
