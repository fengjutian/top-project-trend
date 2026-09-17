// Article editor form. Owns no state — receives the article and emits
// field updates through callbacks.

import type {ChangeEvent} from 'react';
import styles from '../../pages/admin/styles.module.css';
import {ARTICLE_TEMPLATES, toSlug, toLocalDateTime, fromLocalDateTime, inferTags, inferDescription, type Article, type ArticleMetrics} from '../lib/article';

export type ArticleUpdate = (field: keyof Article, value: unknown) => void;
export type ArticleUpdater = ((updater: (current: Article) => Article) => void);

interface EditorFormProps {
  article: Article;
  onUpdate: ArticleUpdate & ArticleUpdater;
  onApplyTemplate: (templateName: string) => void;
  metrics: ArticleMetrics;
  onPickMediaForImage?: () => void;
}

export default function EditorForm({article, onUpdate, onApplyTemplate, metrics, onPickMediaForImage}: EditorFormProps) {
  const handleTitle = (event: ChangeEvent<HTMLInputElement>) => {
    const title = event.target.value;
    onUpdate((current) => ({...current, title, slug: current.path || current.slug ? current.slug : toSlug(title)}));
  };
  const handlePublishAt = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onUpdate((current) => ({...current, publish_at: fromLocalDateTime(value), draft: value ? true : current.draft}));
  };
  return (
    <div className={styles.form}>
      {!article.path && (
        <div className={styles.templateBar}>
          <span>从模板开始</span>
          {Object.entries(ARTICLE_TEMPLATES).map(([name, template]) => (
            <button type="button" key={name} onClick={() => onApplyTemplate(name)}>{template.label}</button>
          ))}
        </div>
      )}

      <input
        className={styles.titleInput}
        value={article.title}
        onChange={handleTitle}
        placeholder="文章标题"
      />

      <div className={styles.grid}>
        <label>发布日期<input type="date" value={article.date} onChange={(event) => onUpdate('date', event.target.value)} /></label>
        <label>链接标识<div className={styles.inlineInput}><input value={article.slug} onChange={(event) => onUpdate('slug', event.target.value)} /><button type="button" onClick={() => onUpdate('slug', toSlug(article.title))}>生成</button></div></label>
        <label>作者<input value={article.authors} onChange={(event) => onUpdate('authors', event.target.value)} /></label>
        <label className={styles.checkbox}><input type="checkbox" checked={article.draft} onChange={(event) => onUpdate('draft', event.target.checked)} />保存为草稿</label>
      </div>

      <div className={styles.scheduleGrid}>
        <label>定时发布<input type="datetime-local" value={toLocalDateTime(article.publish_at)} onChange={handlePublishAt} /><small>到达时间后自动关闭草稿状态</small></label>
        <label>自动下线<input type="datetime-local" value={toLocalDateTime(article.unpublish_at)} onChange={(event) => onUpdate('unpublish_at', fromLocalDateTime(event.target.value))} /><small>到达时间后自动转为草稿</small></label>
      </div>

      <label>标签<div className={styles.inlineInput}><input value={article.tags.join(', ')} onChange={(event) => onUpdate('tags', event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean))} placeholder="React, AI, GitHub" /><button type="button" onClick={() => onUpdate('tags', inferTags(article.title, article.body))}>智能提取</button></div></label>
      <label>摘要<div className={styles.inlineInput}><textarea rows={2} value={article.description} onChange={(event) => onUpdate('description', event.target.value)} /><button type="button" onClick={() => onUpdate('description', inferDescription(article.body))}>自动摘要</button></div></label>
      <label>封面路径<div className={styles.inlineInput}><input value={article.image} onChange={(event) => onUpdate('image', event.target.value)} placeholder="/top-project-trend/media/..." />{onPickMediaForImage && <button type="button" onClick={onPickMediaForImage}>从媒体库选</button>}</div></label>
      <div className={styles.documentMeta}>
        <span>{metrics.count} 字</span>
        <span>约 {metrics.minutes} 分钟阅读</span>
        <span>{metrics.headings.length} 个章节</span>
        <span>自动保存已开启</span>
      </div>
      <div className={styles.writingArea}>
        <label className={styles.bodyLabel}>正文<textarea value={article.body} onChange={(event) => onUpdate('body', event.target.value)} placeholder="使用 Markdown 开始写作…" /></label>
        <aside className={styles.outline}>
          <strong>文章大纲</strong>
          {metrics.headings.length
            ? metrics.headings.map((heading, index) => (
                <span key={`${heading.title}-${index}`} style={{paddingLeft: `${(heading.level - 2) * 12}px`}}>{heading.title}</span>
              ))
            : <small>使用二级或三级标题组织正文</small>}
        </aside>
      </div>
    </div>
  );
}