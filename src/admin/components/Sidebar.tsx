// Left sidebar: brand, deployment status, search, section picker, filters,
// dashboard / new buttons, batch actions, article list, logout.

import DeploymentStatus from './DeploymentStatus';
import {OWNER, REPO, type WorkflowRun} from '../lib/github';
import {SECTIONS} from '../lib/article';
import type {ArticleEntry} from '../hooks/useArticles';
import {Input} from './ui/input';
import {Button} from './ui/button';
import {Checkbox} from './ui/checkbox';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from './ui/select';
import {ScrollArea} from './ui/scroll-area';
import {Separator} from './ui/separator';
import {Plus, LayoutDashboard, Search, LogOut, FileText} from 'lucide-react';
import {cn} from '../lib/utils';

export type StatusFilter = 'all' | 'draft' | 'published';
export type Workspace = 'editor' | 'dashboard';

interface SidebarProps {
  deployment: WorkflowRun | null;
  query: string;
  onQueryChange: (value: string) => void;
  section: string;
  onSectionChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  workspace: Workspace;
  onOpenDashboard: () => void;
  onNewArticle: () => void;
  loading: boolean;
  visibleArticles: ArticleEntry[];
  activePath: string;
  selectedPaths: string[];
  onToggleSelected: (path: string) => void;
  onClearSelection: () => void;
  batching: boolean;
  onBatchSetDraft: (draft: boolean) => void;
  onSelectArticle: (item: ArticleEntry) => void;
  onSetWorkspace: (workspace: Workspace) => void;
  onLogout: () => void;
}

const STATUS_FILTERS: Array<{value: StatusFilter; label: string}> = [
  {value: 'all', label: '全部'},
  {value: 'draft', label: '草稿'},
  {value: 'published', label: '已发布'},
];

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
}: SidebarProps) {
  return (
    <aside className="bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-fg))] flex h-screen flex-col">
      {/* Brand */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-700 to-amber-500 text-white font-extrabold">
            F
          </div>
          <div className="flex flex-col leading-tight">
            <strong className="font-serif text-base">Content Studio</strong>
            <small className="text-xs text-[hsl(var(--sidebar-muted))]">{OWNER}/{REPO}</small>
          </div>
        </div>
      </div>

      <DeploymentStatus deployment={deployment} />

      {/* Search + section */}
      <div className="px-5 mt-2 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--sidebar-muted))]" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="搜索文章"
            className="h-9 border-[hsl(var(--sidebar-border))] bg-[hsl(28_18%_16%)] pl-9 text-[hsl(var(--sidebar-fg))] placeholder:text-[hsl(var(--sidebar-muted))] focus-visible:ring-amber-700/40"
          />
        </div>
        <Select value={section} onValueChange={onSectionChange}>
          <SelectTrigger className="border-[hsl(var(--sidebar-border))] bg-[hsl(28_18%_16%)] text-[hsl(var(--sidebar-fg))] focus:ring-amber-700/40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SECTIONS.map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status filters */}
      <div className="px-5 mt-2">
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-[hsl(28_18%_16%)] p-1">
          {STATUS_FILTERS.map(({value, label}) => (
            <button
              key={value}
              type="button"
              onClick={() => onStatusFilterChange(value)}
              className={cn(
                'rounded-md py-1.5 text-xs font-medium transition-colors',
                statusFilter === value
                  ? 'bg-[hsl(28_18%_26%)] text-white'
                  : 'text-[hsl(var(--sidebar-muted))] hover:text-white'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard + New article */}
      <div className="px-5 mt-3 space-y-2">
        <Button
          variant="outline"
          className="w-full justify-center border-[hsl(var(--sidebar-border))] bg-transparent text-[hsl(var(--sidebar-fg))] hover:bg-[hsl(28_18%_22%)] hover:text-white"
          onClick={onOpenDashboard}
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          {workspace === 'dashboard' ? '返回编辑器' : '全站仪表盘'}
        </Button>
        <Button
          className="w-full bg-amber-700 hover:bg-amber-800 text-white"
          onClick={onNewArticle}
        >
          <Plus className="mr-2 h-4 w-4" />
          新建文章
        </Button>
      </div>

      {/* Batch actions */}
      {selectedPaths.length > 0 && (
        <div className="mx-5 mt-3 rounded-lg border border-[hsl(var(--sidebar-border))] bg-[hsl(28_18%_20%)] p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[hsl(var(--sidebar-muted))]">已选择 {selectedPaths.length} 篇</span>
            <button
              type="button"
              onClick={onClearSelection}
              className="text-[hsl(var(--sidebar-muted))] hover:text-white"
            >
              取消
            </button>
          </div>
          <Separator className="my-2 bg-[hsl(var(--sidebar-border))]" />
          <div className="grid grid-cols-2 gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              disabled={batching}
              onClick={() => onBatchSetDraft(true)}
              className="h-7 bg-[hsl(28_18%_28%)] text-[hsl(var(--sidebar-fg))] hover:bg-[hsl(28_18%_34%)]"
            >
              转草稿
            </Button>
            <Button
              size="sm"
              disabled={batching}
              onClick={() => onBatchSetDraft(false)}
              className="h-7 bg-amber-700 text-white hover:bg-amber-800"
            >
              发布
            </Button>
          </div>
        </div>
      )}

      {/* Article list */}
      <ScrollArea className="mt-4 flex-1 px-3">
        {loading ? (
          <p className="px-3 py-6 text-center text-xs text-[hsl(var(--sidebar-muted))]">
            正在读取文章…
          </p>
        ) : visibleArticles.length === 0 ? (
          <div className="px-3 py-10 text-center">
            <FileText className="mx-auto h-8 w-8 text-[hsl(var(--sidebar-muted))]" />
            <p className="mt-2 text-xs text-[hsl(var(--sidebar-muted))]">没有匹配的文章</p>
          </div>
        ) : (
          <ul className="space-y-0.5 pb-4">
            {visibleArticles.map((item) => {
              const active = activePath === item.path;
              return (
                <li
                  key={item.path}
                  className={cn(
                    'group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors',
                    active ? 'bg-[hsl(28_18%_24%)]' : 'hover:bg-[hsl(28_18%_20%)]'
                  )}
                >
                  <Checkbox
                    checked={selectedPaths.includes(item.path)}
                    onCheckedChange={() => onToggleSelected(item.path)}
                    aria-label={`选择 ${item.title}`}
                    className="border-[hsl(var(--sidebar-border))] data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                  />
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => { onSelectArticle(item); onSetWorkspace('editor'); }}
                  >
                    <div className={cn(
                      'truncate text-sm',
                      active ? 'text-white' : 'text-[hsl(var(--sidebar-fg))] group-hover:text-white'
                    )}>
                      {item.title || item.filename}
                    </div>
                    <div className="text-[11px] text-[hsl(var(--sidebar-muted))]">
                      {item.date || '无日期'}{item.draft ? ' · 草稿' : ''}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>

      <div className="border-t border-[hsl(var(--sidebar-border))] px-5 py-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(28_18%_22%)] hover:text-white"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          退出当前会话
        </Button>
      </div>
    </aside>
  );
}