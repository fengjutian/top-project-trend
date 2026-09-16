import React, {useEffect, useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './styles.module.css';

const OWNER = 'fengjutian';
const REPO = 'top-project-trend';
const BRANCH = 'main';
const SECTIONS = [
  ['blog', '技术周刊'], ['java', 'Java'], ['code', '编程综合'],
  ['ts', 'TypeScript'], ['algorithm', '算法'], ['golang', 'Go'],
  ['rust', 'Rust'], ['python', 'Python'], ['android', 'Android'],
  ['lang-chain', 'LangChain'], ['mcp', 'MCP'], ['llm', 'LLM'],
  ['static-website', '资源网站'],
];
const ARTICLE_TEMPLATES = {
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

const emptyArticle = () => ({
  title: '', slug: '', date: new Date().toISOString().slice(0, 10),
  authors: 'fengjutian', tags: [], draft: true, description: '', image: '', body: '',
  publish_at: '', unpublish_at: '', rawFrontmatter: '', path: '', sha: '', savedContent: '',
});

function toSlug(value) {
  return value.normalize('NFKD').toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-|-$/g, '') || 'new-article';
}

function decodeBase64(value) {
  const bytes = Uint8Array.from(atob(value.replace(/\n/g, '')), (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function safeFilename(value) {
  const dot = value.lastIndexOf('.');
  const stem = dot > 0 ? value.slice(0, dot) : value;
  return toSlug(stem).replace(/[\u4e00-\u9fff]/g, '') || 'image';
}

function toLocalDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function fromLocalDateTime(value) {
  return value ? new Date(value).toISOString() : '';
}

async function optimizeImage(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2560 / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let quality = 0.84;
  let blob;
  do {
    blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
    quality -= 0.08;
  } while (blob?.size > 200 * 1024 && quality >= 0.36);
  if (!blob || blob.size > 200 * 1024) throw new Error('图片压缩后仍超过 200KB，请先裁剪后再上传。');
  return blob;
}

async function blobToBase64(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function parseArticle(source) {
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

function serializeArticle(article) {
  const known = {
    date: article.date,
    slug: article.slug,
    title: article.title,
    authors: article.authors || 'fengjutian',
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

function inferDescription(body) {
  return body.replace(/<[^>]+>/g, '').replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[[^\]]+\]\([^)]*\)/g, (match) => match.slice(1, match.indexOf(']')))
    .replace(/^#{1,6}\s+/gm, '').replace(/[`*_>-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 160);
}

function inferTags(title, body) {
  const text = `${title} ${body}`.toLowerCase();
  const keywords = ['React', 'Vue', 'TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'Java', 'Android', 'AI', 'LLM', 'MCP', 'CSS', 'WebGL', 'GitHub'];
  return keywords.filter((keyword) => text.includes(keyword.toLowerCase())).slice(0, 6);
}

function auditArticle(article, articles) {
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

function articleMetrics(body) {
  const plain = body.replace(/```[\s\S]*?```/g, '').replace(/<[^>]+>/g, '').replace(/[#>*_`\[\]()!-]/g, ' ');
  const chinese = (plain.match(/[\u4e00-\u9fff]/g) || []).length;
  const words = (plain.match(/[A-Za-z0-9]+/g) || []).length;
  const count = chinese + words;
  const headings = [...body.matchAll(/^(#{2,4})\s+(.+)$/gm)].map((match) => ({level: match[1].length, title: match[2]}));
  return {count, minutes: Math.max(1, Math.ceil(count / 350)), headings};
}

async function github(path, token, options = {}) {
  const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(detail.message || `GitHub 请求失败（${response.status}）`);
  }
  return response.json();
}

function MarkdownPreview({source}) {
  const blocks = source.split(/\n{2,}/).filter(Boolean);
  return <div className={styles.previewBody}>{blocks.map((block, index) => {
    const heading = block.match(/^(#{1,4})\s+(.+)/);
    if (heading) {
      const Tag = `h${heading[1].length}`;
      return <Tag key={index}>{heading[2]}</Tag>;
    }
    if (block.startsWith('```')) return <pre key={index}><code>{block.replace(/^```\w*\n?|```$/g, '')}</code></pre>;
    if (/^(?:[-*]\s+.+\n?)+$/.test(block)) return <ul key={index}>{block.split('\n').map((line) => <li key={line}>{line.replace(/^[-*]\s+/, '')}</li>)}</ul>;
    const image = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) return <img key={index} src={image[2]} alt={image[1]} />;
    return <p key={index}>{block}</p>;
  })}</div>;
}

function AdminApp() {
  const storedToken = sessionStorage.getItem('top-project-admin-token') || '';
  const [token, setToken] = useState(storedToken);
  const [tokenInput, setTokenInput] = useState(storedToken);
  const [connected, setConnected] = useState(Boolean(storedToken));
  const [section, setSection] = useState('blog');
  const [articles, setArticles] = useState([]);
  const [article, setArticle] = useState(emptyArticle);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [panel, setPanel] = useState(null);
  const [history, setHistory] = useState([]);
  const [media, setMedia] = useState([]);
  const [panelLoading, setPanelLoading] = useState(false);
  const [workspace, setWorkspace] = useState('editor');
  const [selectedPaths, setSelectedPaths] = useState([]);
  const [batching, setBatching] = useState(false);
  const [deployment, setDeployment] = useState(null);
  const [focusMode, setFocusMode] = useState(false);

  const dirty = useMemo(() => article.savedContent
    ? serializeArticle(article) !== article.savedContent
    : Boolean(article.title || article.slug || article.body || article.description || article.image || article.tags.length), [article]);
  const visibleArticles = useMemo(() => articles.filter((item) => {
    const matchesQuery = `${item.title} ${item.slug}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'draft' ? item.draft : !item.draft);
    return matchesQuery && matchesStatus;
  }), [articles, query, statusFilter]);
  const currentIssues = useMemo(() => auditArticle(article, articles), [article, articles]);
  const tagStats = useMemo(() => {
    const counts = new Map();
    articles.forEach((item) => item.tags.forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [articles]);
  const dashboard = useMemo(() => ({
    total: articles.length,
    drafts: articles.filter((item) => item.draft).length,
    published: articles.filter((item) => !item.draft).length,
    unhealthy: articles.filter((item) => auditArticle(item, articles).some((issue) => issue.level === 'error')).length,
    missingDescription: articles.filter((item) => !item.description).length,
    missingImage: articles.filter((item) => !item.image).length,
  }), [articles]);
  const metrics = useMemo(() => articleMetrics(article.body), [article.body]);

  useEffect(() => {
    const warn = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  useEffect(() => {
    if (!connected) return undefined;
    const key = `top-project-draft:${article.path || `${section}:new`}`;
    const timer = window.setTimeout(() => {
      if (dirty) localStorage.setItem(key, JSON.stringify({content: serializeArticle(article), savedAt: new Date().toISOString()}));
      else localStorage.removeItem(key);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [article, connected, dirty, section]);

  useEffect(() => {
    const shortcuts = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (connected && !saving) save();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        document.querySelector(`.${styles.search} input`)?.focus();
      }
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        setPreview((value) => !value);
      }
    };
    window.addEventListener('keydown', shortcuts);
    return () => window.removeEventListener('keydown', shortcuts);
  });

  async function loadDeployment(authToken = token) {
    try {
      const result = await github(`actions/runs?branch=${BRANCH}&per_page=1`, authToken);
      setDeployment(result.workflow_runs?.[0] || null);
    } catch {
      setDeployment(null);
    }
  }

  async function listMarkdownFiles(directory, authToken) {
    const entries = await github(`contents/${directory}?ref=${BRANCH}`, authToken);
    const nested = await Promise.all(entries.map(async (entry) => {
      if (entry.type === 'dir') return listMarkdownFiles(entry.path, authToken);
      return entry.type === 'file' && /\.mdx?$/.test(entry.name) ? [entry] : [];
    }));
    return nested.flat();
  }

  async function listFiles(directory, authToken, matcher) {
    const entries = await github(`contents/${directory}?ref=${BRANCH}`, authToken);
    const nested = await Promise.all(entries.map(async (entry) => {
      if (entry.type === 'dir') return listFiles(entry.path, authToken, matcher);
      return entry.type === 'file' && matcher(entry) ? [entry] : [];
    }));
    return nested.flat();
  }

  function withRecoveredDraft(item) {
    const key = `top-project-draft:${item.path || `${section}:new`}`;
    const saved = localStorage.getItem(key);
    if (!saved) return item;
    try {
      const draft = JSON.parse(saved);
      if (!draft.content || draft.content === item.savedContent) return item;
      if (!window.confirm(`发现 ${new Date(draft.savedAt).toLocaleString()} 自动保存的内容，是否恢复？`)) {
        localStorage.removeItem(key);
        return item;
      }
      return {...parseArticle(draft.content), path: item.path, sha: item.sha, filename: item.filename, savedContent: item.savedContent};
    } catch {
      localStorage.removeItem(key);
      return item;
    }
  }

  async function loadArticles(nextSection = section, authToken = token) {
    if (!authToken) return;
    setLoading(true);
    setMessage('');
    try {
      const markdownFiles = await listMarkdownFiles(`content/${nextSection}`, authToken);
      const entries = await Promise.all(markdownFiles.map(async (file) => {
        const data = await github(`contents/${file.path}?ref=${BRANCH}`, authToken);
        const parsed = parseArticle(decodeBase64(data.content));
        return {...parsed, path: file.path, sha: data.sha, filename: file.name};
      }));
      entries.sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.title.localeCompare(b.title));
      setArticles(entries);
      setArticle(withRecoveredDraft(entries[0] || emptyArticle()));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (connected) loadArticles(section); }, [section]); // eslint-disable-line react-hooks/exhaustive-deps

  function connect() {
    const nextToken = tokenInput.trim();
    sessionStorage.setItem('top-project-admin-token', nextToken);
    setToken(nextToken);
    setConnected(true);
    loadArticles(section, nextToken);
    loadDeployment(nextToken);
  }

  function newArticle() {
    if (dirty && !window.confirm('当前修改尚未保存，确定新建文章吗？')) return;
    setArticle(withRecoveredDraft(emptyArticle()));
    setPreview(false);
    setMessage('正在创建新文章');
  }

  function update(field, value) {
    setArticle((current) => ({...current, [field]: value}));
  }

  function selectArticle(item) {
    if (dirty && article.path !== item.path && !window.confirm('当前修改尚未保存，确定切换文章吗？')) return;
    setArticle(withRecoveredDraft(item));
    setPreview(false);
    setMessage('');
  }

  function changeSection(nextSection) {
    if (dirty && !window.confirm('当前修改尚未保存，确定切换栏目吗？')) return;
    setSection(nextSection);
    setArticle(emptyArticle());
    setPreview(false);
    setSelectedPaths([]);
    setWorkspace('editor');
  }

  function toggleSelected(path) {
    setSelectedPaths((current) => current.includes(path) ? current.filter((item) => item !== path) : [...current, path]);
  }

  async function commitArticleUpdate(item, changes, messageText) {
    const current = await github(`contents/${item.path}?ref=${BRANCH}`, token);
    if (current.sha !== item.sha) throw new Error(`《${item.title}》已在其他位置更新，批量操作已停止。`);
    const changed = {...item, ...changes};
    await github(`contents/${item.path}`, token, {
      method: 'PUT',
      body: JSON.stringify({message: messageText, content: encodeBase64(serializeArticle(changed)), sha: item.sha, branch: BRANCH}),
    });
  }

  async function batchSetDraft(draft) {
    const targets = articles.filter((item) => selectedPaths.includes(item.path));
    if (!targets.length) return;
    if (!window.confirm(`确定将 ${targets.length} 篇文章设为${draft ? '草稿' : '已发布'}吗？`)) return;
    setBatching(true);
    setMessage('正在执行批量操作…');
    try {
      for (const item of targets) {
        await commitArticleUpdate(item, {draft}, `content: 批量${draft ? '转为草稿' : '发布'} ${item.title}`);
      }
      setSelectedPaths([]);
      await loadArticles(section);
      setMessage(`已更新 ${targets.length} 篇文章。`);
    } catch (error) {
      setMessage(error.message);
      await loadArticles(section);
    } finally {
      setBatching(false);
    }
  }

  async function renameTag(oldTag) {
    const nextTag = window.prompt(`将标签“${oldTag}”合并或重命名为：`, oldTag);
    if (!nextTag || nextTag.trim() === oldTag) return;
    const normalized = nextTag.trim();
    const targets = articles.filter((item) => item.tags.includes(oldTag));
    if (!window.confirm(`将在 ${targets.length} 篇文章中把“${oldTag}”改为“${normalized}”，是否继续？`)) return;
    setBatching(true);
    setMessage('正在更新标签…');
    try {
      for (const item of targets) {
        const tags = [...new Set(item.tags.map((tag) => tag === oldTag ? normalized : tag))];
        await commitArticleUpdate(item, {tags}, `content: 标签 ${oldTag} 改为 ${normalized}`);
      }
      await loadArticles(section);
      setMessage(`已在 ${targets.length} 篇文章中更新标签。`);
    } catch (error) {
      setMessage(error.message);
      await loadArticles(section);
    } finally {
      setBatching(false);
    }
  }

  function duplicateArticle() {
    const copy = {
      ...article,
      title: `${article.title}（副本）`,
      slug: `${article.slug || toSlug(article.title)}-copy`,
      draft: true,
      path: '',
      sha: '',
      savedContent: '',
      rawFrontmatter: article.rawFrontmatter.replace(/^date:.*$/m, '').replace(/^slug:.*$/m, '').replace(/^title:.*$/m, ''),
    };
    setArticle(copy);
    setMessage('已创建副本，修改后保存即可生成新文章。');
  }

  function applyTemplate(templateName) {
    const template = ARTICLE_TEMPLATES[templateName];
    if (!template) return;
    if (article.body.trim() && !window.confirm('应用模板会替换当前正文，确定继续吗？')) return;
    update('body', template.body);
    setMessage(`已应用“${template.label}”模板。`);
  }

  async function deleteArticle() {
    if (!article.path || !article.sha) return;
    if (!window.confirm(`确定永久删除《${article.title}》吗？Git 历史中仍可恢复。`)) return;
    setSaving(true);
    try {
      await github(`contents/${article.path}`, token, {
        method: 'DELETE',
        body: JSON.stringify({message: `content: 删除 ${article.title}`, sha: article.sha, branch: BRANCH}),
      });
      await loadArticles(section);
      setMessage('文章已从当前版本删除，可通过 Git 历史恢复。');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!article.slug) {
      setMessage('请先填写标题并生成链接标识。');
      return;
    }
    setUploading(true);
    setMessage('正在压缩并上传图片…');
    try {
      const blob = await optimizeImage(file);
      const year = article.date.slice(0, 4);
      const filename = `${safeFilename(file.name)}-${Date.now().toString(36)}.webp`;
      const repoPath = `static/media/${section}/${year}/${article.slug}/${filename}`;
      await github(`contents/${repoPath}`, token, {
        method: 'PUT',
        body: JSON.stringify({
          message: `media: 上传 ${filename}`,
          content: await blobToBase64(blob),
          branch: BRANCH,
        }),
      });
      const publicPath = `/top-project-trend/media/${section}/${year}/${article.slug}/${filename}`;
      update('body', `${article.body.trimEnd()}\n\n![${file.name.replace(/\.[^.]+$/, '')}](${publicPath})\n`);
      setMessage(`图片已压缩至 ${Math.round(blob.size / 1024)}KB 并插入正文，请保存文章。`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploading(false);
    }
  }

  async function openHistory() {
    if (!article.path) return;
    setPanel('history');
    setPanelLoading(true);
    try {
      const commits = await github(`commits?path=${encodeURIComponent(article.path)}&sha=${BRANCH}&per_page=20`, token);
      setHistory(commits);
    } catch (error) {
      setMessage(error.message);
      setPanel(null);
    } finally {
      setPanelLoading(false);
    }
  }

  async function restoreVersion(commitSha) {
    setPanelLoading(true);
    try {
      const data = await github(`contents/${article.path}?ref=${commitSha}`, token);
      const restored = parseArticle(decodeBase64(data.content));
      setArticle((current) => ({...restored, path: current.path, sha: current.sha, filename: current.filename, savedContent: current.savedContent}));
      setPanel(null);
      setMessage('历史版本已载入编辑器，确认内容后点击保存才会提交。');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setPanelLoading(false);
    }
  }

  async function openMedia() {
    setPanel('media');
    setPanelLoading(true);
    try {
      const files = await listFiles(`static/media/${section}`, token, (entry) => /\.(webp|png|jpe?g|gif|svg)$/i.test(entry.name));
      files.sort((a, b) => b.path.localeCompare(a.path));
      setMedia(files);
    } catch (error) {
      if (/404/.test(error.message) || /Not Found/i.test(error.message)) setMedia([]);
      else setMessage(error.message);
    } finally {
      setPanelLoading(false);
    }
  }

  function mediaPublicPath(item) {
    return `/top-project-trend/${item.path.replace(/^static\//, '')}`;
  }

  function insertMedia(item) {
    const path = mediaPublicPath(item);
    update('body', `${article.body.trimEnd()}\n\n![${item.name.replace(/\.[^.]+$/, '')}](${path})\n`);
    setPanel(null);
    setMessage('图片已插入正文，请保存文章。');
  }

  async function deleteMedia(item) {
    const publicPath = mediaPublicPath(item);
    const references = articles.filter((entry) => entry.body.includes(publicPath) || entry.body.includes(item.name));
    if (references.length) {
      setMessage(`无法删除：该图片可能被 ${references.length} 篇文章引用。`);
      return;
    }
    if (!window.confirm(`确定删除媒体文件 ${item.name} 吗？`)) return;
    setPanelLoading(true);
    try {
      await github(`contents/${item.path}`, token, {
        method: 'DELETE',
        body: JSON.stringify({message: `media: 删除 ${item.name}`, sha: item.sha, branch: BRANCH}),
      });
      setMedia((current) => current.filter((entry) => entry.path !== item.path));
      setMessage('媒体文件已删除。');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setPanelLoading(false);
    }
  }

  function logout() {
    if (dirty && !window.confirm('当前修改尚未保存，确定退出吗？')) return;
    sessionStorage.removeItem('top-project-admin-token');
    setToken('');
    setTokenInput('');
    setConnected(false);
    setArticles([]);
    setArticle(emptyArticle());
  }

  async function save() {
    if (!article.title.trim() || !article.slug.trim() || !article.date) {
      setMessage('标题、链接标识和发布日期不能为空。');
      return;
    }
    const blockingIssues = currentIssues.filter((issue) => issue.level === 'error');
    if (!article.draft && blockingIssues.length) {
      setMessage(`发布已阻止：请先处理 ${blockingIssues.length} 个错误级检查项。`);
      setPanel('audit');
      return;
    }
    if (article.publish_at && article.unpublish_at && new Date(article.publish_at) >= new Date(article.unpublish_at)) {
      setMessage('自动下线时间必须晚于定时发布时间。');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const filename = article.path || `content/${section}/${article.date.replaceAll('-', '')}-${article.slug}-blog.md`;
      if (article.path && article.sha) {
        const current = await github(`contents/${article.path}?ref=${BRANCH}`, token);
        if (current.sha !== article.sha) {
          throw new Error('保存已停止：GitHub 上的文章在你编辑期间发生了变化。请复制当前内容后刷新，再合并修改。');
        }
      }
      const content = encodeBase64(serializeArticle(article));
      const payload = {
        message: `${article.sha ? 'content: 更新' : 'content: 新增'} ${article.title}`,
        content,
        branch: BRANCH,
        ...(article.sha ? {sha: article.sha} : {}),
      };
      await github(`contents/${filename}`, token, {method: 'PUT', body: JSON.stringify(payload)});
      localStorage.removeItem(`top-project-draft:${article.path || `${section}:new`}`);
      await loadArticles(section);
      setMessage('已提交到 GitHub，部署工作流将自动发布。');
      window.setTimeout(() => loadDeployment(token), 1500);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (!connected) return <div className={styles.connectCard}>
    <div className={styles.eyebrow}>CONTENT STUDIO</div>
    <h1>连接 GitHub</h1>
    <p>使用只授权当前仓库 Contents 读写权限的 Fine-grained Token。Token 仅保存在当前浏览器会话，关闭标签页后清除。</p>
    <input type="password" value={tokenInput} onChange={(event) => setTokenInput(event.target.value)} placeholder="github_pat_..." />
    <button type="button" onClick={connect} disabled={!tokenInput.trim()}>进入管理后台</button>
  </div>;

  return <div className={`${styles.studio} ${focusMode ? styles.studioFocus : ''}`}>
    <aside className={styles.sidebar}>
      <div className={styles.brand}><span>F</span><div><strong>Content Studio</strong><small>{OWNER}/{REPO}</small></div></div>
      {deployment && <a className={`${styles.deployStatus} ${deployment.conclusion === 'success' ? styles.deploySuccess : deployment.status === 'in_progress' ? styles.deployRunning : styles.deployFailed}`} href={deployment.html_url} target="_blank" rel="noreferrer"><span />{deployment.status === 'in_progress' ? '正在部署' : deployment.conclusion === 'success' ? '最近部署成功' : '最近部署失败'}</a>}
      <label className={styles.search}><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索文章" /></label>
      <select value={section} onChange={(event) => changeSection(event.target.value)}>
        {SECTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <div className={styles.filters}>
        {[['all', '全部'], ['draft', '草稿'], ['published', '已发布']].map(([value, label]) =>
          <button type="button" key={value} className={statusFilter === value ? styles.filterActive : ''} onClick={() => setStatusFilter(value)}>{label}</button>)}
      </div>
      <button type="button" className={styles.dashboardButton} onClick={() => setWorkspace(workspace === 'dashboard' ? 'editor' : 'dashboard')}>{workspace === 'dashboard' ? '返回编辑器' : '内容仪表盘'}</button>
      <button type="button" className={styles.newButton} onClick={newArticle}>＋ 新建文章</button>
      {selectedPaths.length > 0 && <div className={styles.batchBar}>
        <span>已选择 {selectedPaths.length} 篇</span>
        <div><button type="button" disabled={batching} onClick={() => batchSetDraft(true)}>转草稿</button><button type="button" disabled={batching} onClick={() => batchSetDraft(false)}>发布</button><button type="button" onClick={() => setSelectedPaths([])}>取消</button></div>
      </div>}
      <div className={styles.articleList}>
        {loading ? <p className={styles.muted}>正在读取文章…</p> : visibleArticles.map((item) =>
          <div key={item.path} className={`${styles.articleRow} ${article.path === item.path ? styles.active : ''}`}>
            <input type="checkbox" checked={selectedPaths.includes(item.path)} onChange={() => toggleSelected(item.path)} aria-label={`选择 ${item.title}`} />
            <button type="button" className={styles.articleItem} onClick={() => { selectArticle(item); setWorkspace('editor'); }}>
              <strong>{item.title || item.filename}</strong>
              <span>{item.date || '无日期'} {item.draft ? '· 草稿' : ''}</span>
            </button>
          </div>)}
      </div>
      <button type="button" className={styles.logout} onClick={logout}>退出当前会话</button>
    </aside>

    {workspace === 'dashboard' ? <main className={styles.dashboard}>
      <header><div><span className={styles.eyebrow}>CONTENT OVERVIEW</span><h1>{SECTIONS.find(([value]) => value === section)?.[1]}仪表盘</h1></div><button type="button" onClick={() => setPanel('tags')}>管理标签</button></header>
      <div className={styles.metricGrid}>
        <article><span>文章总数</span><strong>{dashboard.total}</strong></article>
        <article><span>已发布</span><strong>{dashboard.published}</strong></article>
        <article><span>草稿</span><strong>{dashboard.drafts}</strong></article>
        <article><span>存在错误</span><strong>{dashboard.unhealthy}</strong></article>
        <article><span>缺少摘要</span><strong>{dashboard.missingDescription}</strong></article>
        <article><span>缺少封面</span><strong>{dashboard.missingImage}</strong></article>
      </div>
      <section className={styles.healthTable}>
        <h2>内容健康度</h2>
        {articles.map((item) => {
          const issues = auditArticle(item, articles);
          return <button type="button" key={item.path} onClick={() => { selectArticle(item); setWorkspace('editor'); }}><span><strong>{item.title}</strong><small>{item.date} · {item.draft ? '草稿' : '已发布'}</small></span><em className={issues.some((issue) => issue.level === 'error') ? styles.issueError : issues.length ? styles.issueWarn : styles.issueOk}>{issues.length ? `${issues.length} 项` : '健康'}</em></button>;
        })}
      </section>
    </main> : <main className={styles.editor}>
      <header className={styles.toolbar}>
        <div><span className={article.draft ? styles.draft : styles.published}>{article.draft ? '草稿' : '已发布'}</span>{dirty && <span className={styles.unsaved}>未保存</span>}<small>{article.path || '新文章'}</small></div>
        <div className={styles.toolbarActions}>
          <button type="button" onClick={() => setPanel('audit')}>检查 <span className={styles.issueCount}>{currentIssues.length}</span></button>
          <button type="button" onClick={() => setFocusMode((value) => !value)}>{focusMode ? '退出专注' : '专注'}</button>
          <label className={styles.uploadButton}>{uploading ? '上传中…' : '上传图片'}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadImage} disabled={uploading} /></label>
          <button type="button" onClick={openMedia}>媒体库</button>
          <button type="button" onClick={openHistory} disabled={!article.path}>版本</button>
          <button type="button" onClick={duplicateArticle} disabled={!article.title}>复制</button>
          <button type="button" className={styles.danger} onClick={deleteArticle} disabled={!article.path || saving}>删除</button>
          <button type="button" onClick={() => setPreview((value) => !value)}>{preview ? '继续编辑' : '预览'}</button>
          <button type="button" className={styles.primary} onClick={save} disabled={saving}>{saving ? '提交中…' : article.draft ? '保存草稿' : '提交并发布'}</button>
        </div>
      </header>

      {message && <div className={styles.message}>{message}</div>}

      {preview ? <article className={styles.preview}>
        <div className={styles.previewMeta}>{article.date} · {article.tags.join(' / ')}</div>
        <h1>{article.title || '无标题文章'}</h1>
        {article.description && <p className={styles.lead}>{article.description}</p>}
        <MarkdownPreview source={article.body} />
      </article> : <div className={styles.form}>
        {!article.path && <div className={styles.templateBar}><span>从模板开始</span>{Object.entries(ARTICLE_TEMPLATES).map(([name, template]) => <button type="button" key={name} onClick={() => applyTemplate(name)}>{template.label}</button>)}</div>}
        <input className={styles.titleInput} value={article.title} onChange={(event) => {
          const title = event.target.value;
          setArticle((current) => ({...current, title, slug: current.path || current.slug ? current.slug : toSlug(title)}));
        }} placeholder="文章标题" />

        <div className={styles.grid}>
          <label>发布日期<input type="date" value={article.date} onChange={(event) => update('date', event.target.value)} /></label>
          <label>链接标识<div className={styles.inlineInput}><input value={article.slug} onChange={(event) => update('slug', event.target.value)} /><button type="button" onClick={() => update('slug', toSlug(article.title))}>生成</button></div></label>
          <label>作者<input value={article.authors} onChange={(event) => update('authors', event.target.value)} /></label>
          <label className={styles.checkbox}><input type="checkbox" checked={article.draft} onChange={(event) => update('draft', event.target.checked)} />保存为草稿</label>
        </div>

        <div className={styles.scheduleGrid}>
          <label>定时发布<input type="datetime-local" value={toLocalDateTime(article.publish_at)} onChange={(event) => { update('publish_at', fromLocalDateTime(event.target.value)); if (event.target.value) update('draft', true); }} /><small>到达时间后自动关闭草稿状态</small></label>
          <label>自动下线<input type="datetime-local" value={toLocalDateTime(article.unpublish_at)} onChange={(event) => update('unpublish_at', fromLocalDateTime(event.target.value))} /><small>到达时间后自动转为草稿</small></label>
        </div>

        <label>标签<div className={styles.inlineInput}><input value={article.tags.join(', ')} onChange={(event) => update('tags', event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean))} placeholder="React, AI, GitHub" /><button type="button" onClick={() => update('tags', inferTags(article.title, article.body))}>智能提取</button></div></label>
        <label>摘要<div className={styles.inlineInput}><textarea rows="2" value={article.description} onChange={(event) => update('description', event.target.value)} /><button type="button" onClick={() => update('description', inferDescription(article.body))}>自动摘要</button></div></label>
        <label>封面路径<input value={article.image} onChange={(event) => update('image', event.target.value)} placeholder="/top-project-trend/media/..." /></label>
        <div className={styles.documentMeta}><span>{metrics.count} 字</span><span>约 {metrics.minutes} 分钟阅读</span><span>{metrics.headings.length} 个章节</span><span>自动保存已开启</span></div>
        <div className={styles.writingArea}>
          <label className={styles.bodyLabel}>正文<textarea value={article.body} onChange={(event) => update('body', event.target.value)} placeholder="使用 Markdown 开始写作…" /></label>
          <aside className={styles.outline}><strong>文章大纲</strong>{metrics.headings.length ? metrics.headings.map((heading, index) => <span key={`${heading.title}-${index}`} style={{paddingLeft: `${(heading.level - 2) * 12}px`}}>{heading.title}</span>) : <small>使用二级或三级标题组织正文</small>}</aside>
        </div>
      </div>}
    </main>}

    {panel && <div className={styles.modalBackdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) setPanel(null); }}>
      <section className={styles.modal}>
        <header><div><span className={styles.eyebrow}>{panel === 'history' ? 'VERSION CONTROL' : panel === 'media' ? 'MEDIA LIBRARY' : panel === 'audit' ? 'CONTENT AUDIT' : 'TAG MANAGER'}</span><h2>{panel === 'history' ? '文章版本' : panel === 'media' ? `${SECTIONS.find(([value]) => value === section)?.[1]}媒体库` : panel === 'audit' ? '发布前检查' : '标签管理'}</h2></div><button type="button" onClick={() => setPanel(null)}>×</button></header>
        {panelLoading ? <p className={styles.panelEmpty}>正在读取…</p> : panel === 'history' ? <div className={styles.historyList}>
          {history.length ? history.map((item) => <div key={item.sha} className={styles.historyItem}>
            <div><strong>{item.commit.message}</strong><span>{item.commit.author?.name} · {new Date(item.commit.author?.date).toLocaleString()}</span><code>{item.sha.slice(0, 8)}</code></div>
            <button type="button" onClick={() => restoreVersion(item.sha)}>载入此版本</button>
          </div>) : <p className={styles.panelEmpty}>暂无版本记录</p>}
        </div> : panel === 'media' ? <div className={styles.mediaGrid}>
          {media.length ? media.map((item) => <article key={item.path} className={styles.mediaItem}>
            <img src={item.download_url} alt={item.name} loading="lazy" />
            <strong title={item.path}>{item.name}</strong>
            <span>{Math.round((item.size || 0) / 1024)}KB</span>
            <div><button type="button" onClick={() => insertMedia(item)}>插入</button><button type="button" className={styles.danger} onClick={() => deleteMedia(item)}>删除</button></div>
          </article>) : <p className={styles.panelEmpty}>当前栏目还没有集中管理的媒体文件</p>}
        </div> : panel === 'audit' ? <div className={styles.auditList}>
          {currentIssues.length ? currentIssues.map((issue, index) => <div key={`${issue.text}-${index}`} className={issue.level === 'error' ? styles.auditError : styles.auditWarn}><span>{issue.level === 'error' ? '错误' : '建议'}</span><p>{issue.text}</p></div>) : <div className={styles.auditSuccess}>未发现发布阻断项，文章状态良好。</div>}
          <p className={styles.auditNote}>外部链接是否真实可访问需要服务端检查，本页面只检查链接格式。</p>
        </div> : <div className={styles.tagList}>
          {tagStats.length ? tagStats.map(([tag, count]) => <button type="button" key={tag} onClick={() => renameTag(tag)} disabled={batching}><strong>{tag}</strong><span>{count} 篇</span><em>合并 / 重命名</em></button>) : <p className={styles.panelEmpty}>当前栏目还没有标签</p>}
        </div>}
      </section>
    </div>}
  </div>;
}

export default function AdminPage() {
  return <Layout title="内容管理" noFooter>
    <BrowserOnly fallback={<div className={styles.loading}>正在加载管理后台…</div>}>
      {() => <AdminApp />}
    </BrowserOnly>
  </Layout>;
}
