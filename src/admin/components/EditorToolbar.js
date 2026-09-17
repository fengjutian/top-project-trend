// Toolbar above the article editor: status pill, action buttons, save / delete / preview.

import styles from '../../pages/admin/styles.module.css';

export default function EditorToolbar({
  article,
  dirty,
  saving,
  uploading,
  preview,
  focusMode,
  issueCount,
  onTogglePreview,
  onToggleFocus,
  onOpenMedia,
  onOpenHistory,
  onOpenAudit,
  onDuplicate,
  onDelete,
  onSave,
  onUploadImage,
}) {
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
        <button type="button" onClick={onOpenAudit}>
          检查 <span className={styles.issueCount}>{issueCount}</span>
        </button>
        <button type="button" onClick={onToggleFocus}>
          {focusMode ? '退出专注' : '专注'}
        </button>
        <label className={styles.uploadButton}>
          {uploading ? '上传中…' : '上传图片'}
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onUploadImage} disabled={uploading} />
        </label>
        <button type="button" onClick={onOpenMedia}>媒体库</button>
        <button type="button" onClick={onOpenHistory} disabled={!article.path}>版本</button>
        <button type="button" onClick={onDuplicate} disabled={!article.title}>复制</button>
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