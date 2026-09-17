// Read-only article preview: title, lead, then the compiled MDX body.

import ExactMdxPreview from './ExactMdxPreview';
import type {Article} from '../lib/article';

export default function ArticlePreview({article}: {article: Article}) {
  return (
    <article className="reading-prose mx-auto max-w-3xl px-8 py-10">
      <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
        {article.date} · {article.tags.join(' / ')}
      </div>
      <h1 className="font-serif text-4xl font-semibold tracking-tight">{article.title || '无标题文章'}</h1>
      {article.description && (
        <p className="mt-3 border-l-2 border-accent pl-4 text-lg italic text-muted-foreground">
          {article.description}
        </p>
      )}
      <div className="mt-8">
        <ExactMdxPreview source={article.body} articlePath={article.path} />
      </div>
    </article>
  );
}