// Toolbar above the article editor: status pill, action buttons, save / delete / preview.

import {useEffect, useRef, useState, type ChangeEvent} from 'react';
import type {Article, AuditIssue} from '../lib/article';
import {Badge} from './ui/badge';
import {Button} from './ui/button';
import {Separator} from './ui/separator';
import {cn} from '../lib/utils';
import {
  AlertCircle, MoreHorizontal, Eye, Trash2, Save,
  Image as ImageIcon, History, Maximize2, Minimize2, Copy, FolderOpen,
} from 'lucide-react';

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
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 px-8 backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <Badge variant={article.draft ? 'draft' : 'published'}>
          {article.draft ? '草稿' : '已发布'}
        </Badge>
        {dirty && (
          <span className="text-xs font-medium text-amber-700">未保存</span>
        )}
        <span className="truncate text-xs text-muted-foreground">
          {article.path || '新文章'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Audit popover */}
        <div
          className="relative"
          onMouseEnter={() => setAuditOpen(true)}
          onMouseLeave={() => setAuditOpen(false)}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenAudit}
            aria-expanded={auditOpen}
          >
            <AlertCircle className="mr-1.5 h-4 w-4" />
            检查
            <span className={cn(
              'ml-1.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-bold',
              issues.some((i) => i.level === 'error')
                ? 'bg-destructive text-destructive-foreground'
                : 'bg-amber-100 text-amber-800'
            )}>
              {issues.length}
            </span>
          </Button>
          {auditOpen && issues.length > 0 && (
            <div
              className="absolute right-0 top-full z-30 mt-2 rounded-md border border-border bg-popover p-2 shadow-md w-72"
              role="tooltip"
              onClick={() => {
                setAuditOpen(false);
                onOpenAudit();
              }}
            >
              {previewIssues.map((issue, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-2 rounded px-2 py-1.5 text-xs',
                    issue.level === 'error'
                      ? 'bg-rose-50 text-rose-900'
                      : 'bg-amber-50 text-amber-900'
                  )}
                >
                  <strong className="shrink-0 font-medium">
                    {issue.level === 'error' ? '错误' : '提示'}
                  </strong>
                  <span className="leading-snug">{issue.text}</span>
                </div>
              ))}
              {moreCount > 0 && (
                <div className="mt-1 px-2 py-1 text-[11px] text-muted-foreground">
                  还有 {moreCount} 项,点此查看全部
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upload image */}
        <label className="inline-flex h-8 cursor-pointer items-center rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground">
          <ImageIcon className="mr-1.5 h-4 w-4" />
          {uploading ? '上传中…' : '上传图片'}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={onUploadImage}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {/* More menu */}
        <div className="relative" ref={moreRef}>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setMoreOpen((value) => !value)}
            aria-haspopup="menu"
            aria-expanded={moreOpen}
            aria-label="更多操作"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          {moreOpen && (
            <div
              className="absolute right-0 top-full z-30 mt-2 w-44 rounded-md border border-border bg-popover p-1 shadow-md"
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                onClick={runMore(onOpenMedia)}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
              >
                <FolderOpen className="h-4 w-4" />
                媒体库
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={runMore(onToggleFocus)}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
              >
                {focusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                {focusMode ? '退出专注' : '专注'}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={runMore(onOpenHistory)}
                disabled={!article.path}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
              >
                <History className="h-4 w-4" />
                版本
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={runMore(onDuplicate)}
                disabled={!article.title}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
              >
                <Copy className="h-4 w-4" />
                复制
              </button>
            </div>
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDelete}
          disabled={!article.path || saving}
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="mr-1.5 h-4 w-4" />
          删除
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onTogglePreview}
        >
          <Eye className="mr-1.5 h-4 w-4" />
          {preview ? '继续编辑' : '预览'}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onSave}
          disabled={saving}
          className="bg-primary hover:bg-primary/90"
        >
          <Save className="mr-1.5 h-4 w-4" />
          {saving ? '提交中…' : article.draft ? '保存草稿' : '提交并发布'}
        </Button>
      </div>
    </header>
  );
}