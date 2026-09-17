// Modal that hosts the secondary panels (history / media / audit / cleanup / tags).
// Renders the matching body based on the `panel` prop.

import {SECTIONS} from '../lib/article';
import styles from '../../pages/admin/styles.module.css';

const HEADER_MAP = {
  history:   {eyebrow: 'VERSION CONTROL', title: '文章版本'},
  media:     {eyebrow: 'MEDIA LIBRARY',   title: null},
  audit:     {eyebrow: 'CONTENT AUDIT',   title: '发布前检查'},
  cleanup:   {eyebrow: 'MEDIA CLEANUP',   title: '媒体清理建议'},
  tags:      {eyebrow: 'TAG MANAGER',     title: '标签管理'},
};

function resolveTitle(panel, section) {
  if (panel === 'media') {
    const found = SECTIONS.find(([value]) => value === section);
    return `${found?.[1] ?? ''}媒体库`;
  }
  return HEADER_MAP[panel]?.title;
}

export default function PanelModal({
  panel,
  section,
  panelLoading,
  onClose,
  history, onRestoreVersion,
  media, onInsertMedia, onDeleteMedia,
  issues,
  mediaReport, onDeleteCleanupMedia,
  tagStats, onRenameTag, batching,
}) {
  if (!panel) return null;
  const header = HEADER_MAP[panel];
  const title = resolveTitle(panel, section);
  return (
    <div className={styles.modalBackdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={styles.modal}>
        <header>
          <div><span className={styles.eyebrow}>{header.eyebrow}</span><h2>{title}</h2></div>
          <button type="button" onClick={onClose}>×</button>
        </header>

        {panelLoading ? <p className={styles.panelEmpty}>正在读取…</p> :
         panel === 'history' ? (
           <div className={styles.historyList}>
             {history.length ? history.map((item) => (
               <div key={item.sha} className={styles.historyItem}>
                 <div>
                   <strong>{item.commit.message}</strong>
                   <span>{item.commit.author?.name} · {new Date(item.commit.author?.date).toLocaleString()}</span>
                   <code>{item.sha.slice(0, 8)}</code>
                 </div>
                 <button type="button" onClick={() => onRestoreVersion(item.sha)}>载入此版本</button>
               </div>
             )) : <p className={styles.panelEmpty}>暂无版本记录</p>}
           </div>
         ) : panel === 'media' ? (
           <div className={styles.mediaGrid}>
             {media.length ? media.map((item) => (
               <article key={item.path} className={styles.mediaItem}>
                 <img src={item.download_url} alt={item.name} loading="lazy" />
                 <strong title={item.path}>{item.name}</strong>
                 <span>{Math.round((item.size || 0) / 1024)}KB</span>
                 <div>
                   <button type="button" onClick={() => onInsertMedia(item)}>插入</button>
                   <button type="button" className={styles.danger} onClick={() => onDeleteMedia(item)}>删除</button>
                 </div>
               </article>
             )) : <p className={styles.panelEmpty}>当前栏目还没有集中管理的媒体文件</p>}
           </div>
         ) : panel === 'audit' ? (
           <div className={styles.auditList}>
             {issues.length ? issues.map((issue, index) => (
               <div key={`${issue.text}-${index}`} className={issue.level === 'error' ? styles.auditError : styles.auditWarn}>
                 <span>{issue.level === 'error' ? '错误' : '建议'}</span>
                 <p>{issue.text}</p>
               </div>
             )) : <div className={styles.auditSuccess}>未发现发布阻断项，文章状态良好。</div>}
             <p className={styles.auditNote}>外部链接是否真实可访问需要服务端检查，本页面只检查链接格式。</p>
           </div>
         ) : panel === 'cleanup' ? (
           <div className={styles.cleanupList}>
             <p className={styles.cleanupNotice}>“未引用”基于文件名匹配，删除前仍需人工确认。重复文件仅展示，不自动删除。</p>
             {(mediaReport?.media || []).filter((item) => !item.referenced).map((item) => (
               <div key={item.path}>
                 <span><strong>{item.path}</strong><small>{Math.round(item.size / 1024)}KB</small></span>
                 <button type="button" onClick={() => onDeleteCleanupMedia(item)}>删除</button>
               </div>
             ))}
             {!mediaReport?.summary?.unreferenced && <p className={styles.panelEmpty}>没有发现未引用媒体。</p>}
             {!!mediaReport?.duplicates?.length && (
               <details>
                 <summary>{mediaReport.duplicates.length} 组重复文件</summary>
                 {mediaReport.duplicates.map((paths, index) => <p key={index}>{paths.join(' ｜ ')}</p>)}
               </details>
             )}
           </div>
         ) : (
           <div className={styles.tagList}>
             {tagStats.length ? tagStats.map(([tag, count]) => (
               <button type="button" key={tag} onClick={() => onRenameTag(tag)} disabled={batching}>
                 <strong>{tag}</strong>
                 <span>{count} 篇</span>
                 <em>合并 / 重命名</em>
               </button>
             )) : <p className={styles.panelEmpty}>当前栏目还没有标签</p>}
           </div>
         )}
      </section>
    </div>
  );
}