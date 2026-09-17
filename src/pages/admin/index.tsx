import type {ChangeEvent} from 'react';
import React, {useEffect, useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './styles.module.css';
import {BRANCH, github, decodeBase64, listMarkdownFiles} from '../../admin/lib/github';
import {
  ARTICLE_TEMPLATES,
  emptyArticle,
  toSlug,
  encodeBase64,
  serializeArticle,
  parseArticle,
  auditArticle,
  articleMetrics,
  type Article,
} from '../../admin/lib/article';
import {safeFilename, optimizeImage, blobToBase64} from '../../admin/lib/media';
import {useDeployment} from '../../admin/hooks/useDeployment';
import {useArticles, type ArticleEntry} from '../../admin/hooks/useArticles';
import {useMedia} from '../../admin/hooks/useMedia';
import {useOperations, type DashboardArticle} from '../../admin/hooks/useOperations';
import DeploymentStatus from '../../admin/components/DeploymentStatus';
import ConnectCard from '../../admin/components/ConnectCard';
import EditorForm from '../../admin/components/EditorForm';
import EditorToolbar from '../../admin/components/EditorToolbar';
import Sidebar, {type StatusFilter, type Workspace} from '../../admin/components/Sidebar';
import Dashboard, {type Calendar, type CalendarCell} from '../../admin/components/Dashboard';
import ArticlePreview from '../../admin/components/ArticlePreview';
import PanelModal, {type PanelType} from '../../admin/components/PanelModal';

interface HistoryCommit {
  sha: string;
  commit: {
    message: string;
    author?: {name?: string; date?: string};
  };
}

function AdminApp() {
  const storedToken = sessionStorage.getItem('top-project-admin-token') || '';
  const [token, setToken] = useState<string>(storedToken);
  const [connected, setConnected] = useState<boolean>(Boolean(storedToken));
  const [section, setSection] = useState<string>('blog');
  const {articles, setArticles, loading, refresh: refreshArticles} = useArticles(section, token);
  const {media, setMedia, refresh: refreshMedia} = useMedia(section, token);
  const {
    globalArticles, setGlobalArticles,
    linkReport, setLinkReport,
    mediaReport, setMediaReport,
    loading: operationsLoading, refresh: refreshOperations,
  } = useOperations(token);
  const [article, setArticle] = useState<Article>(emptyArticle);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [preview, setPreview] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [uploading, setUploading] = useState<boolean>(false);
  const [panel, setPanel] = useState<PanelType | null>(null);
  const [history, setHistory] = useState<HistoryCommit[]>([]);
  const [panelLoading, setPanelLoading] = useState<boolean>(false);
  const [workspace, setWorkspace] = useState<Workspace>('editor');
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [batching, setBatching] = useState<boolean>(false);
  const [deployment, refreshDeployment] = useDeployment(token);
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [calendarMonth, setCalendarMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    document.body.classList.add('content-studio-page');
    return () => document.body.classList.remove('content-studio-page');
  }, []);

  const dirty = useMemo(() => article.savedContent
    ? serializeArticle(article) !== article.savedContent
    : Boolean(article.title || article.slug || article.body || article.description || article.image || article.tags.length), [article]);
  const visibleArticles = useMemo<ArticleEntry[]>(() => articles.filter((item) => {
    const matchesQuery = `${item.title} ${item.slug}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'draft' ? item.draft : !item.draft);
    return matchesQuery && matchesStatus;
  }), [articles, query, statusFilter]);
  const currentIssues = useMemo(() => auditArticle(article, articles), [article, articles]);
  const operationsArticles = globalArticles.length ? globalArticles : articles;
  const tagStats = useMemo<Array<[string, number]>>(() => {
    const counts = new Map<string, number>();
    operationsArticles.forEach((item) => item.tags.forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [operationsArticles]);
  const dashboard = useMemo(() => ({
    total: operationsArticles.length,
    drafts: operationsArticles.filter((item) => item.draft).length,
    published: operationsArticles.filter((item) => !item.draft).length,
    unhealthy: operationsArticles.filter((item) => auditArticle(item, operationsArticles).some((issue) => issue.level === 'error')).length,
    missingDescription: operationsArticles.filter((item) => !item.description).length,
    missingImage: operationsArticles.filter((item) => !item.image).length,
  }), [operationsArticles]);
  const metrics = useMemo(() => articleMetrics(article.body), [article.body]);
  const calendar = useMemo<Calendar>(() => {
    const [year, month] = calendarMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const count = new Date(year, month, 0).getDate();
    const cells: Calendar = Array.from({length: firstDay.getDay()}, () => null);
    for (let day = 1; day <= count; day += 1) {
      const date = `${calendarMonth}-${String(day).padStart(2, '0')}`;
      const events = (operationsArticles as DashboardArticle[]).filter((item) => item.date === date || item.publish_at?.slice(0, 10) === date || item.unpublish_at?.slice(0, 10) === date);
      cells.push({day, date, events});
    }
    return cells;
  }, [calendarMonth, operationsArticles]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
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
    const shortcuts = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (connected && !saving) save();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        document.querySelector<HTMLInputElement>(`.${styles.search} input`)?.focus();
      }
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        setPreview((value) => !value);
      }
    };
    window.addEventListener('keydown', shortcuts);
    return () => window.removeEventListener('keydown', shortcuts);
  });

  function withRecoveredDraft(item: ArticleEntry): ArticleEntry {
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
      return {...parseArticle(draft.content), path: item.path, sha: item.sha, filename: item.filename, savedContent: item.savedContent} as ArticleEntry;
    } catch {
      localStorage.removeItem(key);
      return item;
    }
  }

  async function loadArticles(nextSection = section, authToken = token): Promise<void> {
    if (!authToken) return;
    setMessage('');
    try {
      const entries = await refreshArticles(nextSection, authToken);
      const first = entries[0];
      setArticle(first ? withRecoveredDraft(first) : emptyArticle());
    } catch (error) {
      setMessage((error as Error).message);
    }
  }

  async function loadOperationsData(): Promise<void> {
    if (operationsLoading) return;
    try {
      await refreshOperations(token);
    } catch (error) {
      setMessage((error as Error).message);
    }
  }

  function openDashboard(): void {
    setWorkspace(workspace === 'dashboard' ? 'editor' : 'dashboard');
    if (workspace !== 'dashboard' && !globalArticles.length) loadOperationsData();
  }

  useEffect(() => { if (connected) loadArticles(section); }, [section]); // eslint-disable-line react-hooks/exhaustive-deps

  function connect(nextToken: string): void {
    sessionStorage.setItem('top-project-admin-token', nextToken);
    setToken(nextToken);
    setConnected(true);
    loadArticles(section, nextToken);
    refreshDeployment(nextToken);
  }

  function newArticle(): void {
    if (dirty && !window.confirm('当前修改尚未保存，确定新建文章吗？')) return;
    setArticle(withRecoveredDraft({...emptyArticle(), filename: ''} as ArticleEntry));
    setPreview(false);
    setMessage('正在创建新文章');
  }

  function update<K extends keyof Article>(field: K, value: Article[K]): void;
  function update(updater: (current: Article) => Article): void;
  function update(fieldOrFn: keyof Article | ((current: Article) => Article), value?: unknown): void {
    if (typeof fieldOrFn === 'function') setArticle(fieldOrFn);
    else setArticle((current) => ({...current, [fieldOrFn]: value}));
  }

  function selectArticle(item: ArticleEntry): void {
    if (dirty && article.path !== item.path && !window.confirm('当前修改尚未保存，确定切换文章吗？')) return;
    setArticle(withRecoveredDraft(item));
    setPreview(false);
    setMessage('');
  }

  function changeSection(nextSection: string): void {
    if (dirty && !window.confirm('当前修改尚未保存，确定切换栏目吗？')) return;
    setSection(nextSection);
    setArticle(emptyArticle());
    setPreview(false);
    setSelectedPaths([]);
    setWorkspace('editor');
  }

  function toggleSelected(path: string): void {
    setSelectedPaths((current) => current.includes(path) ? current.filter((item) => item !== path) : [...current, path]);
  }

  async function commitArticleUpdate(item: ArticleEntry, changes: Partial<Article>, messageText: string): Promise<void> {
    const current = await github<{sha: string}>(`contents/${item.path}?ref=${BRANCH}`, token);
    if (current.sha !== item.sha) throw new Error(`《${item.title}》已在其他位置更新，批量操作已停止。`);
    const changed: ArticleEntry = {...item, ...changes};
    await github(`contents/${item.path}`, token, {
      method: 'PUT',
      body: JSON.stringify({message: messageText, content: encodeBase64(serializeArticle(changed)), sha: item.sha, branch: BRANCH}),
    });
  }

  async function batchSetDraft(draft: boolean): Promise<void> {
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
      setMessage((error as Error).message);
      await loadArticles(section);
    } finally {
      setBatching(false);
    }
  }

  async function renameTag(oldTag: string): Promise<void> {
    const nextTag = window.prompt(`将标签“${oldTag}”合并或重命名为：`, oldTag);
    if (!nextTag || nextTag.trim() === oldTag) return;
    const normalized = nextTag.trim();
    const targets = operationsArticles.filter((item) => item.tags.includes(oldTag));
    if (!window.confirm(`将在 ${targets.length} 篇文章中把“${oldTag}”改为“${normalized}”，是否继续？`)) return;
    setBatching(true);
    setMessage('正在更新标签…');
    try {
      for (const item of targets) {
        const tags = [...new Set(item.tags.map((tag) => tag === oldTag ? normalized : tag))];
        await commitArticleUpdate(item, {tags}, `content: 标签 ${oldTag} 改为 ${normalized}`);
      }
      await loadArticles(section);
      await loadOperationsData();
      setMessage(`已在 ${targets.length} 篇文章中更新标签。`);
    } catch (error) {
      setMessage((error as Error).message);
      await loadArticles(section);
    } finally {
      setBatching(false);
    }
  }

  function duplicateArticle(): void {
    const copy: Article = {
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

  function applyTemplate(templateName: string): void {
    const template = ARTICLE_TEMPLATES[templateName];
    if (!template) return;
    if (article.body.trim() && !window.confirm('应用模板会替换当前正文，确定继续吗？')) return;
    update('body', template.body);
    setMessage(`已应用“${template.label}”模板。`);
  }

  async function deleteArticle(): Promise<void> {
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
      setMessage((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>): Promise<void> {
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
      setMessage((error as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function openHistory(): Promise<void> {
    if (!article.path) return;
    setPanel('history');
    setPanelLoading(true);
    try {
      const commits = await github<HistoryCommit[]>(`commits?path=${encodeURIComponent(article.path)}&sha=${BRANCH}&per_page=20`, token);
      setHistory(commits);
    } catch (error) {
      setMessage((error as Error).message);
      setPanel(null);
    } finally {
      setPanelLoading(false);
    }
  }

  async function restoreVersion(commitSha: string): Promise<void> {
    setPanelLoading(true);
    try {
      const data = await github<{content: string}>(`contents/${article.path}?ref=${commitSha}`, token);
      const restored = parseArticle(decodeBase64(data.content));
      setArticle((current) => ({...restored, path: current.path, sha: current.sha, filename: (current as ArticleEntry).filename, savedContent: current.savedContent}));
      setPanel(null);
      setMessage('历史版本已载入编辑器，确认内容后点击保存才会提交。');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setPanelLoading(false);
    }
  }

  async function openMedia(): Promise<void> {
    setPanel('media');
    setPanelLoading(true);
    try {
      await refreshMedia(section, token);
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setPanelLoading(false);
    }
  }

  function mediaPublicPath(item: {path: string}): string {
    return `/top-project-trend/${item.path.replace(/^static\//, '')}`;
  }

  function insertMedia(item: {path: string; name: string}): void {
    const path = mediaPublicPath(item);
    update('body', `${article.body.trimEnd()}\n\n![${item.name.replace(/\.[^.]+$/, '')}](${path})\n`);
    setPanel(null);
    setMessage('图片已插入正文，请保存文章。');
  }

  async function deleteMedia(item: {path: string; name: string; sha: string}): Promise<void> {
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
      setMessage((error as Error).message);
    } finally {
      setPanelLoading(false);
    }
  }

  async function deleteCleanupMedia(item: {path: string; referenced: boolean; size: number}): Promise<void> {
    if (item.referenced) {
      setMessage('该文件仍被文章引用，不能从清理面板删除。');
      return;
    }
    if (!window.confirm(`媒体审计将“${item.path}”标记为可能未引用。仍建议人工复核，确定删除吗？`)) return;
    setPanelLoading(true);
    try {
      const current = await github<{sha: string}>(`contents/${item.path}?ref=${BRANCH}`, token);
      await github(`contents/${item.path}`, token, {
        method: 'DELETE',
        body: JSON.stringify({message: `media: 清理未引用文件 ${item.path.split('/').pop()}`, sha: current.sha, branch: BRANCH}),
      });
      setMediaReport((report) => {
        if (!report) return report;
        return {
          ...report,
          summary: {...report.summary, total: report.summary.total - 1, unreferenced: Math.max(0, report.summary.unreferenced - 1), size: report.summary.size - item.size},
          media: report.media.filter((entry) => entry.path !== item.path),
        };
      });
      setMessage('媒体文件已删除；下一次部署会重新生成审计报告。');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setPanelLoading(false);
    }
  }

  function logout(): void {
    if (dirty && !window.confirm('当前修改尚未保存，确定退出吗？')) return;
    sessionStorage.removeItem('top-project-admin-token');
    setToken('');
    setConnected(false);
    setArticles([]);
    setArticle(emptyArticle());
  }

  async function save(): Promise<void> {
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
        const current = await github<{sha: string}>(`contents/${article.path}?ref=${BRANCH}`, token);
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
      window.setTimeout(() => refreshDeployment(token), 1500);
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (!connected) return <ConnectCard onConnect={connect} />;

  return <div className={`${styles.studio} ${focusMode ? styles.studioFocus : ''}`}>
    <Sidebar
      deployment={deployment}
      query={query} onQueryChange={setQuery}
      section={section} onSectionChange={changeSection}
      statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
      workspace={workspace} onOpenDashboard={openDashboard}
      onNewArticle={newArticle}
      loading={loading}
      visibleArticles={visibleArticles}
      activePath={article.path}
      selectedPaths={selectedPaths}
      onToggleSelected={toggleSelected}
      onClearSelection={() => setSelectedPaths([])}
      batching={batching}
      onBatchSetDraft={batchSetDraft}
      onSelectArticle={selectArticle}
      onSetWorkspace={setWorkspace}
      onLogout={logout}
    />

    {workspace === 'dashboard' ? <Dashboard
      dashboard={dashboard}
      calendarMonth={calendarMonth} onCalendarMonthChange={setCalendarMonth}
      calendar={calendar}
      loading={operationsLoading} onRefresh={loadOperationsData}
      onOpenTags={() => setPanel('tags')}
      onOpenCleanup={() => setPanel('cleanup')}
      linkReport={linkReport}
      mediaReport={mediaReport}
      operationsArticles={operationsArticles as DashboardArticle[]}
    /> : <main className={styles.editor}>
      <EditorToolbar
        article={article}
        dirty={dirty}
        saving={saving}
        uploading={uploading}
        preview={preview}
        focusMode={focusMode}
        issueCount={currentIssues.length}
        onTogglePreview={() => setPreview((value) => !value)}
        onToggleFocus={() => setFocusMode((value) => !value)}
        onOpenMedia={openMedia}
        onOpenHistory={openHistory}
        onOpenAudit={() => setPanel('audit')}
        onDuplicate={duplicateArticle}
        onDelete={deleteArticle}
        onSave={save}
        onUploadImage={uploadImage}
      />

      {message && <div className={styles.message}>{message}</div>}

      {preview ? <ArticlePreview article={article} /> : <EditorForm article={article} onUpdate={update} onApplyTemplate={applyTemplate} metrics={metrics} />}
    </main>}

    {panel && <PanelModal
        panel={panel}
        section={section}
        panelLoading={panelLoading}
        onClose={() => setPanel(null)}
        history={history}
        onRestoreVersion={restoreVersion}
        media={media}
        onInsertMedia={insertMedia}
        onDeleteMedia={deleteMedia}
        issues={currentIssues}
        mediaReport={mediaReport}
        onDeleteCleanupMedia={deleteCleanupMedia}
        tagStats={tagStats}
        onRenameTag={renameTag}
        batching={batching}
      />}
  </div>;
}

export default function AdminPage() {
  return <Layout title="内容管理" noFooter>
    <BrowserOnly fallback={<div className={styles.loading}>正在加载管理后台…</div>}>
      {() => <AdminApp />}
    </BrowserOnly>
  </Layout>;
}