// Toolbar above the article editor: status pill, action buttons, save / delete / preview.

import {useEffect, useRef, useState, type ChangeEvent} from 'react';
import styles from '../../pages/admin/styles.module.css';
import type {Article, AuditIssue} from '../lib/article';

interface EditorToolbarProps {
  article: Article;
  dirty: boolean;
  saving: boolean;
  uploading: boolean;
  preview: boolean;
  focusMode: boolean;
  issues: AuditIssue[];
  onTogglePreview: () => void;
  onToggleFocus: () => void;
  onOpenMedia: () => void;
  onOpenHistory: () => void;
  onOpenAudit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSave: () => void;
  onUploadImage: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function EditorToolbar({
  article, dirty, saving, uploading, preview, focusMode, issues,
  onTogglePreview, onToggleFocus, onOpenMedia, onOpenHistory, onOpenAudit,
  onDuplicate, onDelete, onSave, onUploadImage,
}: EditorToolbarProps) {
  const [auditOpen, setAuditOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const previewIssues = issues.slice(0, 4);
  const moreCount = issues.length - previewIssues.length;

  useEffect(() => {
    if (!moreOpen) return undefined;
    const handle = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [moreOpen]);

  const runMore = (action: () => void) => () => {
    setMoreOpen(false);
    action();
  };

  return (
    <header className={styles.toolbar}>
      <div>
        <span className={article.draft ? styles.draft : styles.published}>
          {article.draft ? '草稿' : '已发布'}
        </span>
        {dirty && <span className={styles.unsaved}>未保存</span>}
        <small>{article.path || '新文章'}</small>
      </div>
      <div className={styles.toolbarActions}>
        <div
          className={styles.auditWrapper}
          onMouseEnter={() => setAuditOpen(true)}
          onMouseLeave={() => setAuditOpen(false)}
        >
          <button
            type="button"
            onClick={onOpenAudit}
            aria-expanded={auditOpen}
            aria-haspopup="dialog"
          >
            检查 <span className={styles.issueCount}>{issues.length}</span>
          </button>
          {auditOpen && issues.length > 0 && (
            <div
              className={styles.auditPopover}
              role="tooltip"
              onClick={() => {
                setAuditOpen(false);
                onOpenAudit();
              }}
            >
              {previewIssues.map((issue, index) => (
                <div key={index} className={`${styles.auditItem} ${issue.level === 'error' ? styles.auditItemError : styles.auditItemWarn}`}>
                  <strong>{issue.level === 'error' ? '错误' : '提示'}</strong>
                  <span>{issue.text}</span>
                </div>
              ))}
              {moreCount > 0 && (
                <div className={styles.auditMore}>还有 {moreCount} 项，点此查看全部</div>
              )}
              {previewIssues.length === 0 && (
                <div className={styles.auditEmpty}>暂无检查项</div>
              )}
            </div>
          )}
        </div>
        <label className={styles.uploadButton}>
          {uploading ? '上传中…' : '上传图片'}
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onUploadImage} disabled={uploading} />
        </label>
        <div className={styles.moreWrapper} ref={moreRef}>
          <button
            type="button"
            onClick={() => setMoreOpen((value) => !value)}
            aria-haspopup="menu"
            aria-expanded={moreOpen}
            aria-label="更多操作"
          >
            ⋯
          </button>
          {moreOpen && (
            <div className={styles.moreMenu} role="menu">
              <button type="button" role="menuitem" onClick={runMore(onOpenMedia)}>媒体库</button>
              <button type="button" role="menuitem" onClick={runMore(onToggleFocus)}>
                {focusMode ? '退出专注' : '专注'}
              </button>
              <button type="button" role="menuitem" onClick={runMore(onOpenHistory)} disabled={!article.path}>版本</button>
              <button type="button" role="menuitem" onClick={runMore(onDuplicate)} disabled={!article.title}>复制</button>
            </div>
          )}
        </div>
        <button type="button" className={styles.danger} onClick={onDelete} disabled={!article.path || saving}>删除</button>
        <button type="button" onClick={onTogglePreview}>
          {preview ? '继续编辑' : '预览'}
        </button>
        <button type="button" className={styles.primary} onClick={onSave} disabled={saving}>
          {saving ? '提交中…' : article.draft ? '保存草稿' : '提交并发布'}
        </button>
      </div>
    </header>
  );
}