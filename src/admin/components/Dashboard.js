// Dashboard view: metrics, calendar, link-audit summary, media report summary,
// content health table.

import {OWNER, REPO} from '../lib/github';
import {auditArticle} from '../lib/article';
import styles from '../../pages/admin/styles.module.css';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function CalendarEvent({item, cellDate}) {
  const day = cellDate.slice(0, 10);
  const variant = item.publish_at?.slice(0, 10) === day
    ? styles.calendarScheduled
    : item.unpublish_at?.slice(0, 10) === day
      ? styles.calendarOffline
      : styles.calendarPublished;
  return <span key={`${item.path}-${item.publish_at}-${item.unpublish_at}`} className={variant} title={item.title}>{item.title}</span>;
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
}) {
  return (
    <main className={styles.dashboard}>
      <header>
        <div><span className={styles.eyebrow}>SITE OPERATIONS</span><h1>全站内容仪表盘</h1></div>
        <div className={styles.dashboardActions}>
          <button type="button" onClick={onRefresh} disabled={loading}>{loading ? '汇总中…' : '刷新数据'}</button>
          <button type="button" onClick={onOpenTags}>管理标签</button>
        </div>
      </header>

      <div className={styles.metricGrid}>
        <article><span>文章总数</span><strong>{dashboard.total}</strong></article>
        <article><span>已发布</span><strong>{dashboard.published}</strong></article>
        <article><span>草稿</span><strong>{dashboard.drafts}</strong></article>
        <article><span>存在错误</span><strong>{dashboard.unhealthy}</strong></article>
        <article><span>缺少摘要</span><strong>{dashboard.missingDescription}</strong></article>
        <article><span>缺少封面</span><strong>{dashboard.missingImage}</strong></article>
      </div>

      <section className={styles.calendarPanel}>
        <header>
          <div><h2>发布日历</h2><p>蓝色为发布日期，黄色为定时发布，灰色为自动下线。</p></div>
          <input type="month" value={calendarMonth} onChange={(event) => onCalendarMonthChange(event.target.value)} />
        </header>
        <div className={styles.calendarWeek}>
          {WEEKDAYS.map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className={styles.calendarGrid}>
          {calendar.map((cell, index) => cell ? (
            <div key={cell.date} className={styles.calendarDay}>
              <strong>{cell.day}</strong>
              {cell.events.slice(0, 4).map((item) => <CalendarEvent key={item.path} item={item} cellDate={cell.date} />)}
              {cell.events.length > 4 && <small>+{cell.events.length - 4}</small>}
            </div>
          ) : <div key={`empty-${index}`} className={styles.calendarEmpty} />)}
        </div>
      </section>

      <div className={styles.operationsGrid}>
        <section className={styles.reportPanel}>
          <header>
            <div>
              <h2>外链检查</h2>
              <small>{linkReport?.generatedAt ? `更新于 ${new Date(linkReport.generatedAt).toLocaleString()}` : '尚未运行检查工作流'}</small>
            </div>
            <a href={`https://github.com/${OWNER}/${REPO}/actions/workflows/link-audit.yml`} target="_blank" rel="noreferrer">运行检查</a>
          </header>
          <div className={styles.reportMetrics}>
            <span><strong>{linkReport?.total || 0}</strong>全部链接</span>
            <span><strong>{linkReport?.healthy || 0}</strong>正常</span>
            <span className={styles.reportBad}><strong>{linkReport?.broken || 0}</strong>异常</span>
          </div>
          <div className={styles.reportList}>
            {linkReport?.links?.filter((item) => !item.ok).slice(0, 8).map((item) => (
              <a key={item.url} href={item.url} target="_blank" rel="noreferrer">
                <strong>{item.status || item.error}</strong>
                <span>{item.url}</span>
              </a>
            ))}
            {!linkReport?.broken && <p>暂无异常外链记录。</p>}
          </div>
        </section>

        <section className={styles.reportPanel}>
          <header>
            <div>
              <h2>媒体清理</h2>
              <small>{mediaReport?.generatedAt ? `更新于 ${new Date(mediaReport.generatedAt).toLocaleString()}` : '部署后生成媒体报告'}</small>
            </div>
            <button type="button" onClick={onOpenCleanup}>查看建议</button>
          </header>
          <div className={styles.reportMetrics}>
            <span><strong>{mediaReport?.summary?.total || 0}</strong>媒体文件</span>
            <span><strong>{mediaReport?.summary?.unreferenced || 0}</strong>可能未引用</span>
            <span><strong>{mediaReport?.summary?.duplicateGroups || 0}</strong>重复组</span>
          </div>
          <div className={styles.mediaSize}>
            总大小 <strong>{((mediaReport?.summary?.size || 0) / 1024 / 1024).toFixed(1)} MB</strong>
          </div>
        </section>
      </div>

      <section className={styles.healthTable}>
        <h2>内容健康度</h2>
        {operationsArticles.map((item) => {
          const issues = auditArticle(item, operationsArticles);
          const tone = issues.some((issue) => issue.level === 'error')
            ? styles.issueError
            : issues.length
              ? styles.issueWarn
              : styles.issueOk;
          return (
            <div key={item.path}>
              <span>
                <strong>{item.title}</strong>
                <small>{item.section || item.path.split('/')[1]} · {item.date} · {item.draft ? '草稿' : '已发布'}</small>
              </span>
              <em className={tone}>{issues.length ? `${issues.length} 项` : '健康'}</em>
            </div>
          );
        })}
      </section>
    </main>
  );
}