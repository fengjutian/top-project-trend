// Left sidebar: brand, deployment status, search, section picker, filters,
// dashboard / new buttons, batch actions, article list, logout.

import DeploymentStatus from './DeploymentStatus';
import {OWNER, REPO} from '../lib/github';
import {SECTIONS} from '../lib/article';
import styles from '../../pages/admin/styles.module.css';

export default function Sidebar({
  deployment,
  query, onQueryChange,
  section, onSectionChange,
  statusFilter, onStatusFilterChange,
  workspace, onOpenDashboard,
  onNewArticle,
  loading,
  visibleArticles,
  activePath,
  selectedPaths, onToggleSelected, onClearSelection,
  batching, onBatchSetDraft,
  onSelectArticle,
  onSetWorkspace,
  onLogout,
}) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span>F</span>
        <div><strong>Content Studio</strong><small>{OWNER}/{REPO}</small></div>
      </div>
      <DeploymentStatus deployment={deployment} />
      <label className={styles.search}>
        <span>⌕</span>
        <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="搜索文章" />
      </label>
      <select value={section} onChange={(event) => onSectionChange(event.target.value)}>
        {SECTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <div className={styles.filters}>
        {[['all', '全部'], ['draft', '草稿'], ['published', '已发布']].map(([value, label]) => (
          <button
            type="button"
            key={value}
            className={statusFilter === value ? styles.filterActive : ''}
            onClick={() => onStatusFilterChange(value)}
          >{label}</button>
        ))}
      </div>
      <button type="button" className={styles.dashboardButton} onClick={onOpenDashboard}>
        {workspace === 'dashboard' ? '返回编辑器' : '全站仪表盘'}
      </button>
      <button type="button" className={styles.newButton} onClick={onNewArticle}>＋ 新建文章</button>
      {selectedPaths.length > 0 && (
        <div className={styles.batchBar}>
          <span>已选择 {selectedPaths.length} 篇</span>
          <div>
            <button type="button" disabled={batching} onClick={() => onBatchSetDraft(true)}>转草稿</button>
            <button type="button" disabled={batching} onClick={() => onBatchSetDraft(false)}>发布</button>
            <button type="button" onClick={onClearSelection}>取消</button>
          </div>
        </div>
      )}
      <div className={styles.articleList}>
        {loading ? <p className={styles.muted}>正在读取文章…</p> : visibleArticles.map((item) => (
          <div key={item.path} className={`${styles.articleRow} ${activePath === item.path ? styles.active : ''}`}>
            <input
              type="checkbox"
              checked={selectedPaths.includes(item.path)}
              onChange={() => onToggleSelected(item.path)}
              aria-label={`选择 ${item.title}`}
            />
            <button
              type="button"
              className={styles.articleItem}
              onClick={() => { onSelectArticle(item); onSetWorkspace('editor'); }}
            >
              <strong>{item.title || item.filename}</strong>
              <span>{item.date || '无日期'} {item.draft ? '· 草稿' : ''}</span>
            </button>
          </div>
        ))}
      </div>
      <button type="button" className={styles.logout} onClick={onLogout}>退出当前会话</button>
    </aside>
  );
}