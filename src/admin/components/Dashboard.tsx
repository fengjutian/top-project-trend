// Dashboard view: metrics, calendar, link-audit summary, media report summary,
// content health table.

import {OWNER, REPO} from '../lib/github';
import {auditArticle} from '../lib/article';
import type {DashboardArticle, LinkReport, MediaReport} from '../hooks/useOperations';
import {Button} from './ui/button';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from './ui/card';
import {Badge} from './ui/badge';
import {RefreshCw, Tags, AlertTriangle, CheckCircle2, FileWarning} from 'lucide-react';
import {cn} from '../lib/utils';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export interface DashboardMetrics {
  total: number;
  drafts: number;
  published: number;
  unhealthy: number;
  missingDescription: number;
  missingImage: number;
}

export interface CalendarCell {
  day: number;
  date: string;
  events: DashboardArticle[];
}

export type Calendar = Array<CalendarCell | null>;

interface CalendarEventProps {
  item: DashboardArticle;
  cellDate: string;
}

function CalendarEvent({item, cellDate}: CalendarEventProps) {
  const day = cellDate.slice(0, 10);
  const tone = item.publish_at?.slice(0, 10) === day
    ? 'bg-amber-100 text-amber-900'
    : item.unpublish_at?.slice(0, 10) === day
      ? 'bg-slate-100 text-slate-700'
      : 'bg-sky-100 text-sky-900';
  return <span key={`${item.path}-${item.publish_at}-${item.unpublish_at}`} className={cn('truncate rounded px-1.5 py-0.5 text-[10px]', tone)} title={item.title}>{item.title}</span>;
}

interface DashboardProps {
  dashboard: DashboardMetrics;
  calendarMonth: string;
  onCalendarMonthChange: (value: string) => void;
  calendar: Calendar;
  loading: boolean;
  onRefresh: () => void;
  onOpenTags: () => void;
  onOpenCleanup: () => void;
  linkReport: LinkReport | null;
  mediaReport: MediaReport | null;
  operationsArticles: DashboardArticle[];
}

export default function Dashboard({
  dashboard,
  calendarMonth, onCalendarMonthChange,
  calendar,
  loading, onRefresh,
  onOpenTags, onOpenCleanup,
  linkReport,
  mediaReport,
  operationsArticles,
}: DashboardProps) {
  return (
    <main className="reading-prose mx-auto w-full max-w-6xl space-y-6 px-8 py-6 overflow-auto">
      <header className="flex items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Site Operations</div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">全站内容仪表盘</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={cn('mr-1.5 h-4 w-4', loading && 'animate-spin')} />
            {loading ? '汇总中…' : '刷新数据'}
          </Button>
          <Button variant="outline" size="sm" onClick={onOpenTags}>
            <Tags className="mr-1.5 h-4 w-4" />
            管理标签
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <MetricCard label="文章总数" value={dashboard.total} />
        <MetricCard label="已发布" value={dashboard.published} />
        <MetricCard label="草稿" value={dashboard.drafts} />
        <MetricCard label="存在错误" value={dashboard.unhealthy} highlight={dashboard.unhealthy > 0} />
        <MetricCard label="缺少摘要" value={dashboard.missingDescription} highlight={dashboard.missingDescription > 0} />
        <MetricCard label="缺少封面" value={dashboard.missingImage} highlight={dashboard.missingImage > 0} />
      </section>

      <Card>
        <CardHeader className="flex-row items-end justify-between space-y-0">
          <div>
            <CardTitle>发布日历</CardTitle>
            <CardDescription>蓝色为发布日期,黄色为定时发布,灰色为自动下线。</CardDescription>
          </div>
          <input
            type="month"
            value={calendarMonth}
            onChange={(event) => onCalendarMonthChange(event.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          />
        </CardHeader>
        <CardContent>
          <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {WEEKDAYS.map((day) => <div key={day}>{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendar.map((cell, index) => cell ? (
              <div key={cell.date} className="min-h-[80px] rounded border border-border p-1.5">
                <div className="mb-1 text-xs font-medium">{cell.day}</div>
                <div className="flex flex-col gap-0.5">
                  {cell.events.slice(0, 4).map((item) => <CalendarEvent key={item.path} item={item} cellDate={cell.date} />)}
                  {cell.events.length > 4 && <span className="text-[10px] text-muted-foreground">+{cell.events.length - 4}</span>}
                </div>
              </div>
            ) : <div key={`empty-${index}`} className="min-h-[80px]" />)}
          </div>
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-end justify-between space-y-0">
            <div>
              <CardTitle>外链检查</CardTitle>
              <CardDescription>
                {linkReport?.generatedAt ? `更新于 ${new Date(linkReport.generatedAt).toLocaleString()}` : '尚未运行检查工作流'}
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <a href={`https://github.com/${OWNER}/${REPO}/actions/workflows/link-audit.yml`} target="_blank" rel="noreferrer">
                运行检查
              </a>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex gap-4 text-sm">
              <span><strong className="text-lg">{linkReport?.total || 0}</strong> 全部链接</span>
              <span><strong className="text-lg text-emerald-700">{linkReport?.healthy || 0}</strong> 正常</span>
              <span><strong className="text-lg text-rose-700">{linkReport?.broken || 0}</strong> 异常</span>
            </div>
            <div className="space-y-1.5">
              {linkReport?.links?.filter((item) => !item.ok).slice(0, 8).map((item) => (
                <a key={item.url} href={item.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-md border border-border bg-card p-2 hover:bg-accent">
                  <span className="font-mono text-xs truncate">{item.url}</span>
                  <Badge variant="destructive">{item.status || item.error}</Badge>
                </a>
              ))}
              {!linkReport?.broken && <p className="text-xs text-muted-foreground">暂无异常外链记录。</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-end justify-between space-y-0">
            <div>
              <CardTitle>媒体清理</CardTitle>
              <CardDescription>
                {mediaReport?.generatedAt ? `更新于 ${new Date(mediaReport.generatedAt).toLocaleString()}` : '部署后生成媒体报告'}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onOpenCleanup}>查看建议</Button>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex gap-4 text-sm">
              <span><strong className="text-lg">{mediaReport?.summary?.total || 0}</strong> 媒体文件</span>
              <span><strong className="text-lg text-amber-700">{mediaReport?.summary?.unreferenced || 0}</strong> 可能未引用</span>
              <span><strong className="text-lg">{mediaReport?.summary?.duplicateGroups || 0}</strong> 重复组</span>
            </div>
            <div className="rounded-md bg-secondary/50 p-3 text-sm">
              总大小 <strong>{((mediaReport?.summary?.size || 0) / 1024 / 1024).toFixed(1)} MB</strong>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>内容健康度</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {operationsArticles.map((item) => {
              const issues = auditArticle(item, operationsArticles);
              const tone = issues.some((issue) => issue.level === 'error')
                ? 'text-rose-700'
                : issues.length
                  ? 'text-amber-700'
                  : 'text-emerald-700';
              const Icon = issues.some((issue) => issue.level === 'error')
                ? AlertTriangle
                : issues.length
                  ? FileWarning
                  : CheckCircle2;
              return (
                <div key={item.path} className="flex items-center justify-between py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{item.title}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {item.section || item.path.split('/')[1]} · {item.date} · {item.draft ? '草稿' : '已发布'}
                    </div>
                  </div>
                  <div className={cn('flex items-center gap-1.5 text-xs font-medium', tone)}>
                    <Icon className="h-3.5 w-3.5" />
                    {issues.length ? `${issues.length} 项` : '健康'}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function MetricCard({label, value, highlight}: {label: string; value: number; highlight?: boolean}) {
  return (
    <Card className={cn(highlight && 'border-amber-300 bg-amber-50')}>
      <CardContent className="p-4">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={cn('mt-1 font-serif text-2xl font-semibold', highlight ? 'text-amber-800' : 'text-foreground')}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}