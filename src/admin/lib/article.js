// Article data layer for the Content Studio admin.
// Pure functions, no React. Safe to import from client-only code paths.

export const SECTIONS = [
  ['blog', '技术周刊'], ['java', 'Java'], ['code', '编程综合'],
  ['ts', 'TypeScript'], ['algorithm', '算法'], ['golang', 'Go'],
  ['rust', 'Rust'], ['python', 'Python'], ['android', 'Android'],
  ['lang-chain', 'LangChain'], ['mcp', 'MCP'], ['llm', 'LLM'],
  ['static-website', '资源网站'],
];

export const ARTICLE_TEMPLATES = {
  weekly: {
    label: '技术周刊',
    body: '## 本期导读\n\n在这里概括本期内容。\n\n## 项目一\n\n![项目截图]()\n\n**项目地址：** https://github.com/\n\n项目简介与推荐理由。\n\n## 项目二\n\n项目简介与推荐理由。\n\n## 总结\n\n本期内容总结。',
  },
  project: {
    label: '开源项目介绍',
    body: '## 项目简介\n\n项目解决了什么问题。\n\n## 核心功能\n\n- 功能一\n- 功能二\n- 功能三\n\n## 快速开始\n\n```bash\n# 安装或运行命令\n```\n\n## 使用体验\n\n优点、限制和适用场景。\n\n## 项目地址\n\nhttps://github.com/',
  },
  tutorial: {
    label: '技术教程',
    body: '## 背景\n\n为什么需要这项技术。\n\n## 环境准备\n\n列出版本和依赖。\n\n## 实现步骤\n\n### 第一步\n\n说明和代码。\n\n### 第二步\n\n说明和代码。\n\n## 常见问题\n\n常见错误及解决方法。\n\n## 总结\n\n回顾关键要点。',
  },
};

export const DEFAULT_AUTHORS = 'fengjutian';

export function emptyArticle() {
  return {
    title: '', slug: '', date: new Date().toISOString().slice(0, 10),
    authors: DEFAULT_AUTHORS, tags: [], draft: true, description: '', image: '', body: '',
    publish_at: '', unpublish_at: '', rawFrontmatter: '', path: '', sha: '', savedContent: '',
  };
}

export function toSlug(value) {
  return value.normalize('NFKD').toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-|-$/g, '') || 'new-article';
}

export function encodeBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

export function toLocalDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function fromLocalDateTime(value) {
  return value ? new Date(value).toISOString() : '';
}

export function parseArticle(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const rawFrontmatter = match?.[1] ?? '';
  const body = match ? source.slice(match[0].length) : source;
  const value = emptyArticle();
  value.rawFrontmatter = rawFrontmatter;
  value.body = body;

  for (const line of rawFrontmatter.split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!field) continue;
    const [, key, raw] = field;
    if (key === 'tags') value.tags = raw.replace(/^\[|\]$/g, '').split(',').map((tag) => tag.trim()).filter(Boolean);
    else if (key === 'draft') value.draft = raw.trim() === 'true';
    else if (Object.hasOwn(value, key)) value[key] = raw.replace(/^['"]|['"]$/g, '');
  }
  value.savedContent = serializeArticle(value);
  return value;
}

export function serializeArticle(article) {
  const known = {
    date: article.date,
    slug: article.slug,
    title: article.title,
    authors: article.authors || DEFAULT_AUTHORS,
    tags: `[${article.tags.join(', ')}]`,
    draft: String(article.draft),
    description: article.description,
    image: article.image,
    publish_at: article.publish_at,
    unpublish_at: article.unpublish_at,
  };
  const seen = new Set();
  const lines = article.rawFrontmatter.split(/\r?\n/).filter(Boolean).map((line) => {
    const match = line.match(/^([A-Za-z_][\w-]*):/);
    if (!match || !(match[1] in known)) return line;
    seen.add(match[1]);
    return known[match[1]] ? `${match[1]}: ${known[match[1]]}` : null;
  }).filter(Boolean);
  for (const [key, value] of Object.entries(known)) {
    if (!seen.has(key) && value) lines.push(`${key}: ${value}`);
  }
  return `---\n${lines.join('\n')}\n---\n\n${article.body.trim()}\n`;
}

export function inferDescription(body) {
  return body.replace(/<[^>]+>/g, '').replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[[^\]]+\]\([^)]*\)/g, (match) => match.slice(1, match.indexOf(']')))
    .replace(/^#{1,6}\s+/gm, '').replace(/[`*_>-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 160);
}

const TAG_KEYWORDS = ['React', 'Vue', 'TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'Java', 'Android', 'AI', 'LLM', 'MCP', 'CSS', 'WebGL', 'GitHub'];

export function inferTags(title, body) {
  const text = `${title} ${body}`.toLowerCase();
  return TAG_KEYWORDS.filter((keyword) => text.includes(keyword.toLowerCase())).slice(0, 6);
}

export function auditArticle(article, articles) {
  const issues = [];
  if (article.title.trim().length < 6) issues.push({level: 'warn', text: '标题较短，建议至少 6 个字符。'});
  if (article.title.length > 60) issues.push({level: 'warn', text: '标题超过 60 个字符，搜索结果可能被截断。'});
  if (!article.description) issues.push({level: 'error', text: '缺少文章摘要。'});
  else if (article.description.length > 160) issues.push({level: 'warn', text: '摘要超过 160 个字符。'});
  if (!article.image) issues.push({level: 'warn', text: '缺少社交分享封面。'});
  if (!article.tags.length) issues.push({level: 'warn', text: '至少添加一个标签。'});
  if (articles.some((item) => item.path !== article.path && item.slug === article.slug)) issues.push({level: 'error', text: `链接标识 ${article.slug} 与其他文章重复。`});
  const emptyLinks = [...article.body.matchAll(/\[[^\]]*\]\(\s*\)/g)];
  if (emptyLinks.length) issues.push({level: 'error', text: `发现 ${emptyLinks.length} 个空链接。`});
  const images = [...article.body.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)];
  const missingAlt = images.filter((match) => !match[1].trim()).length;
  if (missingAlt) issues.push({level: 'warn', text: `${missingAlt} 张图片缺少替代文字。`});
  const headings = [...article.body.matchAll(/^(#{1,6})\s+/gm)].map((match) => match[1].length);
  for (let index = 1; index < headings.length; index += 1) {
    if (headings[index] - headings[index - 1] > 1) {
      issues.push({level: 'warn', text: '正文标题层级存在跳级。'});
      break;
    }
  }
  const malformedUrls = [...article.body.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)]
    .map((match) => match[1]).filter((url) => /^(https?:)/.test(url) && !/^https?:\/\/\S+$/.test(url));
  if (malformedUrls.length) issues.push({level: 'error', text: `发现 ${malformedUrls.length} 个格式异常的外部链接。`});
  return issues;
}

export function articleMetrics(body) {
  const plain = body.replace(/```[\s\S]*?```/g, '').replace(/<[^>]+>/g, '').replace(/[#>*_`\[\]()!-]/g, ' ');
  const chinese = (plain.match(/[\u4e00-\u9fff]/g) || []).length;
  const words = (plain.match(/[A-Za-z0-9]+/g) || []).length;
  const count = chinese + words;
  const headings = [...body.matchAll(/^(#{2,4})\s+(.+)$/gm)].map((match) => ({level: match[1].length, title: match[2]}));
  return {count, minutes: Math.max(1, Math.ceil(count / 350)), headings};
}