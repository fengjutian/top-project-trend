// Renders the deployment status pill (success / running / failed) at the top of
// the sidebar. Returns null when no deployment data is available.

import type {WorkflowRun} from '../lib/github';
import {cn} from '../lib/utils';

export default function DeploymentStatus({deployment}: {deployment: WorkflowRun | null}) {
  if (!deployment) return null;
  const isSuccess = deployment.conclusion === 'success';
  const isRunning = deployment.status === 'in_progress';
  const text = isRunning
    ? '正在部署'
    : isSuccess
      ? '最近部署成功'
      : '最近部署失败';

  const dotClass = isSuccess
    ? 'bg-emerald-400'
    : isRunning
      ? 'bg-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,0.15)]'
      : 'bg-rose-400';

  return (
    <a
      className="mx-5 mb-2 flex items-center gap-2 text-[11px] text-[hsl(var(--sidebar-muted))] hover:text-white transition-colors no-underline"
      href={deployment.html_url}
      target="_blank"
      rel="noreferrer"
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dotClass)} />
      {text}
    </a>
  );
}