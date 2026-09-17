// Article editor form. Owns no state — receives the article and emits
// field updates through callbacks.

import type {ChangeEvent} from 'react';
import {
  ARTICLE_TEMPLATES, toSlug, toLocalDateTime, fromLocalDateTime,
  inferTags, inferDescription, type Article, type ArticleMetrics,
} from '../lib/article';
import {Input} from './ui/input';
import {Textarea} from './ui/textarea';
import {Label} from './ui/label';
import {Button} from './ui/button';
import {Checkbox} from './ui/checkbox';
import {Separator} from './ui/separator';
import {Sparkles, Wand2, Image as ImageIcon, BookOpen, Clock, ListOrdered, Save} from 'lucide-react';
import {cn} from '../lib/utils';

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
    <div className="mx-auto max-w-4xl space-y-7 pb-24 pt-8 reading-prose">
      {!article.path && (
        <div className="rounded-lg border border-dashed border-border bg-secondary/30 p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            从模板开始
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(ARTICLE_TEMPLATES).map(([name, template]) => (
              <Button
                key={name}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onApplyTemplate(name)}
                className="rounded-full"
              >
                {template.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Title — hero style for reading theme */}
      <Input
        value={article.title}
        onChange={handleTitle}
        placeholder="文章标题"
        className="h-auto border-0 bg-transparent px-0 font-serif text-4xl font-semibold tracking-tight shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
      />

      {/* Meta grid */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        <Field label="发布日期">
          <Input
            type="date"
            value={article.date}
            onChange={(event) => onUpdate('date', event.target.value)}
          />
        </Field>
        <Field label="链接标识">
          <div className="flex gap-2">
            <Input
              value={article.slug}
              onChange={(event) => onUpdate('slug', event.target.value)}
              className="font-mono"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onUpdate('slug', toSlug(article.title))}
              className="shrink-0"
            >
              <Wand2 className="mr-1 h-3.5 w-3.5" />
              生成
            </Button>
          </div>
        </Field>
        <Field label="作者">
          <Input
            value={article.authors}
            onChange={(event) => onUpdate('authors', event.target.value)}
          />
        </Field>
        <Field label="状态">
          <label className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3">
            <Checkbox
              checked={article.draft}
              onCheckedChange={(checked) => onUpdate('draft', checked === true)}
            />
            <span className="text-sm">保存为草稿</span>
          </label>
        </Field>
      </div>

      <Separator />

      {/* Schedule grid */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        <Field label="定时发布" hint="到达时间后自动关闭草稿状态">
          <Input
            type="datetime-local"
            value={toLocalDateTime(article.publish_at)}
            onChange={handlePublishAt}
          />
        </Field>
        <Field label="自动下线" hint="到达时间后自动转为草稿">
          <Input
            type="datetime-local"
            value={toLocalDateTime(article.unpublish_at)}
            onChange={(event) => onUpdate('unpublish_at', fromLocalDateTime(event.target.value))}
          />
        </Field>
      </div>

      <Field label="标签">
        <div className="flex gap-2">
          <Input
            value={article.tags.join(', ')}
            onChange={(event) => onUpdate('tags', event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean))}
            placeholder="React, AI, GitHub"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onUpdate('tags', inferTags(article.title, article.body))}
            className="shrink-0"
          >
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            智能提取
          </Button>
        </div>
      </Field>

      <Field label="摘要">
        <div className="flex gap-2">
          <Textarea
            rows={2}
            value={article.description}
            onChange={(event) => onUpdate('description', event.target.value)}
            className="resize-none"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onUpdate('description', inferDescription(article.body))}
            className="h-auto shrink-0 self-start"
          >
            <Wand2 className="mr-1 h-3.5 w-3.5" />
            自动摘要
          </Button>
        </div>
      </Field>

      <Field label="封面路径">
        <div className="flex gap-2">
          <Input
            value={article.image}
            onChange={(event) => onUpdate('image', event.target.value)}
            placeholder="/top-project-trend/media/..."
            className="font-mono"
          />
          {onPickMediaForImage && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onPickMediaForImage}
              className="shrink-0"
            >
              <ImageIcon className="mr-1 h-3.5 w-3.5" />
              从媒体库选
            </Button>
          )}
        </div>
      </Field>

      {/* Document meta */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <Meta icon={<BookOpen className="h-3.5 w-3.5" />}>{metrics.count} 字</Meta>
        <Meta icon={<Clock className="h-3.5 w-3.5" />}>约 {metrics.minutes} 分钟阅读</Meta>
        <Meta icon={<ListOrdered className="h-3.5 w-3.5" />}>{metrics.headings.length} 个章节</Meta>
        <Meta icon={<Save className="h-3.5 w-3.5" />}>自动保存已开启</Meta>
      </div>

      <Separator />

      {/* Body + outline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_220px]">
        <Field label="正文" className="min-w-0">
          <Textarea
            value={article.body}
            onChange={(event) => onUpdate('body', event.target.value)}
            placeholder="使用 Markdown 开始写作…"
            className="min-h-[520px] resize-y font-serif text-base leading-[1.8]"
          />
        </Field>
        <aside className="rounded-lg border border-border bg-card p-4 h-fit sticky top-24">
          <div className="mb-3 font-serif text-sm font-semibold text-foreground">文章大纲</div>
          {metrics.headings.length ? (
            <ul className="space-y-1 text-sm text-muted-foreground">
              {metrics.headings.map((heading, index) => (
                <li
                  key={`${heading.title}-${index}`}
                  style={{paddingLeft: `${(heading.level - 2) * 12}px`}}
                  className="truncate"
                >
                  {heading.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">使用二级或三级标题组织正文</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function Field({
  label, hint, children, className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Meta({icon, children}: {icon: React.ReactNode; children: React.ReactNode}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon}
      {children}
    </span>
  );
}