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

const emptyArticle = () => ({
  title: '', slug: '', date: new Date().toISOString().slice(0, 10),
  authors: 'fengjutian', tags: [], draft: true, description: '', image: '', body: '',
  rawFrontmatter: '', path: '', sha: '',
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

  const visibleArticles = useMemo(() => articles.filter((item) =>
    `${item.title} ${item.slug}`.toLowerCase().includes(query.toLowerCase())), [articles, query]);

  async function listMarkdownFiles(directory, authToken) {
    const entries = await github(`contents/${directory}?ref=${BRANCH}`, authToken);
    const nested = await Promise.all(entries.map(async (entry) => {
      if (entry.type === 'dir') return listMarkdownFiles(entry.path, authToken);
      return entry.type === 'file' && /\.mdx?$/.test(entry.name) ? [entry] : [];
    }));
    return nested.flat();
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
      setArticle(entries[0] || emptyArticle());
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
  }

  function newArticle() {
    setArticle(emptyArticle());
    setPreview(false);
    setMessage('正在创建新文章');
  }

  function update(field, value) {
    setArticle((current) => ({...current, [field]: value}));
  }

  async function save() {
    if (!article.title.trim() || !article.slug.trim() || !article.date) {
      setMessage('标题、链接标识和发布日期不能为空。');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const filename = article.path || `content/${section}/${article.date.replaceAll('-', '')}-${article.slug}-blog.md`;
      const payload = {
        message: `${article.sha ? 'content: 更新' : 'content: 新增'} ${article.title}`,
        content: encodeBase64(serializeArticle(article)),
        branch: BRANCH,
        ...(article.sha ? {sha: article.sha} : {}),
      };
      await github(`contents/${filename}`, token, {method: 'PUT', body: JSON.stringify(payload)});
      setMessage('已提交到 GitHub，部署工作流将自动发布。');
      await loadArticles(section);
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

  return <div className={styles.studio}>
    <aside className={styles.sidebar}>
      <div className={styles.brand}><span>F</span><div><strong>Content Studio</strong><small>{OWNER}/{REPO}</small></div></div>
      <label className={styles.search}><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索文章" /></label>
      <select value={section} onChange={(event) => setSection(event.target.value)}>
        {SECTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <button type="button" className={styles.newButton} onClick={newArticle}>＋ 新建文章</button>
      <div className={styles.articleList}>
        {loading ? <p className={styles.muted}>正在读取文章…</p> : visibleArticles.map((item) =>
          <button type="button" key={item.path} className={`${styles.articleItem} ${article.path === item.path ? styles.active : ''}`} onClick={() => setArticle(item)}>
            <strong>{item.title || item.filename}</strong>
            <span>{item.date || '无日期'} {item.draft ? '· 草稿' : ''}</span>
          </button>)}
      </div>
    </aside>

    <main className={styles.editor}>
      <header className={styles.toolbar}>
        <div><span className={article.draft ? styles.draft : styles.published}>{article.draft ? '草稿' : '已发布'}</span><small>{article.path || '新文章'}</small></div>
        <div className={styles.toolbarActions}>
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

        <label>标签<div className={styles.inlineInput}><input value={article.tags.join(', ')} onChange={(event) => update('tags', event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean))} placeholder="React, AI, GitHub" /><button type="button" onClick={() => update('tags', inferTags(article.title, article.body))}>智能提取</button></div></label>
        <label>摘要<div className={styles.inlineInput}><textarea rows="2" value={article.description} onChange={(event) => update('description', event.target.value)} /><button type="button" onClick={() => update('description', inferDescription(article.body))}>自动摘要</button></div></label>
        <label>封面路径<input value={article.image} onChange={(event) => update('image', event.target.value)} placeholder="/top-project-trend/media/..." /></label>
        <label className={styles.bodyLabel}>正文<textarea value={article.body} onChange={(event) => update('body', event.target.value)} placeholder="使用 Markdown 开始写作…" /></label>
      </div>}
    </main>
  </div>;
}

export default function AdminPage() {
  return <Layout title="内容管理" noFooter>
    <BrowserOnly fallback={<div className={styles.loading}>正在加载管理后台…</div>}>
      {() => <AdminApp />}
    </BrowserOnly>
  </Layout>;
}
