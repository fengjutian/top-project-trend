// Read-only article preview: title, lead, then the compiled MDX body.

import ExactMdxPreview from './ExactMdxPreview';
import styles from '../../pages/admin/styles.module.css';

export default function ArticlePreview({article}) {
  return (
    <article className={styles.preview}>
      <div className={styles.previewMeta}>{article.date} · {article.tags.join(' / ')}</div>
      <h1>{article.title || '无标题文章'}</h1>
      {article.description && <p className={styles.lead}>{article.description}</p>}
      <ExactMdxPreview source={article.body} articlePath={article.path} />
    </article>
  );
}