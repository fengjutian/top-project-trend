// Modal that hosts the secondary panels (history / media / audit / cleanup / tags).
// Renders the matching body based on the `panel` prop.

import {useEffect} from 'react';
import {SECTIONS, type AuditIssue} from '../lib/article';
import type {GitHubEntry} from '../lib/github';
import type {MediaReport} from '../hooks/useOperations';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from './ui/dialog';
import {Button} from './ui/button';
import {Badge} from './ui/badge';
import {cn} from '../lib/utils';

export type PanelType = 'history' | 'media' | 'audit' | 'cleanup' | 'tags';

interface HeaderDef {
  eyebrow: string;
  title: string | null;
}

const HEADER_MAP: Record<PanelType, HeaderDef> = {
  history: {eyebrow: 'VERSION CONTROL', title: '文章版本'},
  media:   {eyebrow: 'MEDIA LIBRARY',   title: null},
  audit:   {eyebrow: 'CONTENT AUDIT',   title: '发布前检查'},
  cleanup: {eyebrow: 'MEDIA CLEANUP',   title: '媒体清理建议'},
  tags:    {eyebrow: 'TAG MANAGER',     title: '标签管理'},
};

interface HistoryCommit {
  sha: string;
  commit: {
    message: string;
    author?: {name?: string; date?: string};
  };
}

interface PanelModalProps {
  panel: PanelType | null;
  section: string;
  panelLoading: boolean;
  onClose: () => void;
  history: HistoryCommit[];
  onRestoreVersion: (sha: string) => void;
  media: GitHubEntry[];
  mediaPickTarget: 'body' | 'image';
  onInsertMedia: (item: GitHubEntry) => void;
  onSelectImageMedia: (item: GitHubEntry) => void;
  onDeleteMedia: (item: GitHubEntry) => void;
  issues: AuditIssue[];
  mediaReport: MediaReport | null;
  onDeleteCleanupMedia: (item: MediaReport['media'][number]) => void;
  tagStats: Array<[string, number]>;
  onRenameTag: (tag: string) => void;
  batching: boolean;
}

function resolveTitle(panel: PanelType, section: string): string | null {
  if (panel === 'media') {
    const found = SECTIONS.find(([value]) => value === section);
    return `${found?.[1] ?? ''}媒体库`;
  }
  return HEADER_MAP[panel]?.title ?? null;
}

export default function PanelModal({
  panel, section, panelLoading, onClose,
  history, onRestoreVersion,
  media, mediaPickTarget, onInsertMedia, onSelectImageMedia, onDeleteMedia,
  issues,
  mediaReport, onDeleteCleanupMedia,
  tagStats, onRenameTag, batching,
}: PanelModalProps) {
  const open = panel !== null;
  useEffect(() => {
    if (!open) return undefined;
    const handle = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [open, onClose]);

  if (!panel) return null;
  const header = HEADER_MAP[panel];
  const title = resolveTitle(panel, section);

  return (
    <Dialog open onOpenChange={(value) => { if (!value) onClose(); }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {header.eyebrow}
          </div>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {panelLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">正在读取…</p>
        ) : panel === 'history' ? (
          <div className="max-h-[60vh] space-y-2 overflow-y-auto">
            {history.length ? history.map((item) => (
              <div key={item.sha} className="flex items-start justify-between gap-3 rounded-md border border-border bg-card p-3">
                <div className="min-w-0 space-y-1">
                  <div className="text-sm font-medium">{item.commit.message}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.commit.author?.name} · {new Date(item.commit.author?.date ?? '').toLocaleString()}
                  </div>
                  <code className="text-[11px] text-muted-foreground">{item.sha.slice(0, 8)}</code>
                </div>
                <Button size="sm" variant="outline" onClick={() => onRestoreVersion(item.sha)}>
                  载入此版本
                </Button>
              </div>
            )) : <p className="py-8 text-center text-sm text-muted-foreground">暂无版本记录</p>}
          </div>
        ) : panel === 'media' ? (
          <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
            {media.length ? media.map((item) => (
              <div key={item.path} className="overflow-hidden rounded-md border border-border bg-card">
                <div className="aspect-square overflow-hidden bg-muted">
                  <img src={item.download_url ?? ''} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div className="space-y-1 p-2">
                  <div className="truncate text-xs font-medium" title={item.path}>{item.name}</div>
                  <div className="text-[10px] text-muted-foreground">{Math.round((item.size || 0) / 1024)}KB</div>
                </div>
                <div className="flex gap-1 border-t border-border p-2">
                  {mediaPickTarget === 'image'
                    ? <Button size="sm" className="flex-1 h-7 text-xs" onClick={() => onSelectImageMedia(item)}>设为封面</Button>
                    : <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => onInsertMedia(item)}>插入</Button>}
                  <Button size="sm" variant="outline" className="h-7 text-xs text-destructive hover:bg-destructive/10" onClick={() => onDeleteMedia(item)}>删除</Button>
                </div>
              </div>
            )) : <p className="col-span-full py-8 text-center text-sm text-muted-foreground">当前栏目还没有集中管理的媒体文件</p>}
          </div>
        ) : panel === 'audit' ? (
          <div className="space-y-2">
            {issues.length ? issues.map((issue, index) => (
              <div
                key={`${issue.text}-${index}`}
                className={cn(
                  'rounded-md border p-3 text-sm',
                  issue.level === 'error'
                    ? 'border-rose-200 bg-rose-50 text-rose-900'
                    : 'border-amber-200 bg-amber-50 text-amber-900'
                )}
              >
                <Badge variant={issue.level === 'error' ? 'destructive' : 'draft'} className="mb-1.5">
                  {issue.level === 'error' ? '错误' : '建议'}
                </Badge>
                <p className="leading-snug">{issue.text}</p>
              </div>
            )) : (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                未发现发布阻断项,文章状态良好。
              </div>
            )}
            <p className="pt-2 text-xs text-muted-foreground">外部链接是否真实可访问需要服务端检查,本页面只检查链接格式。</p>
          </div>
        ) : panel === 'cleanup' ? (
          <div className="space-y-3">
            <p className="rounded-md bg-secondary/50 p-3 text-xs text-muted-foreground">
              "未引用" 基于文件名匹配,删除前仍需人工确认。重复文件仅展示,不自动删除。
            </p>
            <div className="max-h-[50vh] space-y-1.5 overflow-y-auto">
              {(mediaReport?.media || []).filter((item) => !item.referenced).map((item) => (
                <div key={item.path} className="flex items-center justify-between gap-3 rounded-md border border-border bg-card p-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{item.path}</div>
                    <div className="text-[11px] text-muted-foreground">{Math.round(item.size / 1024)}KB</div>
                  </div>
                  <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => onDeleteCleanupMedia(item)}>
                    删除
                  </Button>
                </div>
              ))}
              {!mediaReport?.summary?.unreferenced && (
                <p className="py-8 text-center text-sm text-muted-foreground">没有发现未引用媒体。</p>
              )}
            </div>
            {!!mediaReport?.duplicates?.length && (
              <details className="rounded-md border border-border bg-card p-3">
                <summary className="cursor-pointer text-sm font-medium">
                  {mediaReport.duplicates.length} 组重复文件
                </summary>
                <div className="mt-2 space-y-1">
                  {mediaReport.duplicates.map((paths, index) => (
                    <p key={index} className="text-xs text-muted-foreground">{paths.join(' | ')}</p>
                  ))}
                </div>
              </details>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {tagStats.length ? tagStats.map(([tag, count]) => (
              <button
                type="button"
                key={tag}
                onClick={() => onRenameTag(tag)}
                disabled={batching}
                className="rounded-md border border-border bg-card p-3 text-left transition-colors hover:bg-accent disabled:opacity-50"
              >
                <div className="font-medium">{tag}</div>
                <div className="text-xs text-muted-foreground">{count} 篇</div>
                <div className="mt-1 text-[11px] text-accent-foreground/60">合并 / 重命名</div>
              </button>
            )) : <p className="col-span-full py-8 text-center text-sm text-muted-foreground">当前栏目还没有标签</p>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}