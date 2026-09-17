// Usage: pnpm article:new <section> <title>
// Creates a new draft MDX file under content/<section>/ with a sane front matter.

import {existsSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const SECTIONS: ReadonlySet<string> = new Set([
  'blog', 'algorithm', 'android', 'code', 'golang', 'java', 'lang-chain',
  'llm', 'mcp', 'python', 'rust', 'static-website', 'ts',
]);

const DEFAULT_AUTHORS = 'fengjutian';

function slugify(title: string): string {
  return title
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-|-$/g, '') || 'new-article';
}

function main(argv: string[]): void {
  const [section, ...titleParts] = argv;
  const title = titleParts.join(' ').trim();

  if (!section || !SECTIONS.has(section) || !title) {
    console.error('Usage: pnpm article:new <section> <title>');
    console.error(`Sections: ${[...SECTIONS].join(', ')}`);
    process.exit(1);
  }

  const slug = slugify(title);
  const publishDate = new Date().toISOString().slice(0, 10);
  const filename = `${publishDate.replaceAll('-', '')}-${slug}-blog.md`;
  const target = resolve('content', section, filename);

  if (existsSync(target)) throw new Error(`Article already exists: ${target}`);

  writeFileSync(target, `---
date: ${publishDate}
slug: ${slug}
title: ${title}
authors: ${DEFAULT_AUTHORS}
tags: []
draft: true
---

在这里开始写文章。
`);

  console.log(`Created: ${target}`);
}

main(process.argv.slice(2));