// Renders the deployment status pill (success / running / failed) at the top of
// the sidebar. Returns null when no deployment data is available.

import styles from '../../pages/admin/styles.module.css';

export default function DeploymentStatus({deployment}) {
  if (!deployment) return null;
  const variant = deployment.conclusion === 'success'
    ? styles.deploySuccess
    : deployment.status === 'in_progress'
      ? styles.deployRunning
      : styles.deployFailed;
  const text = deployment.status === 'in_progress'
    ? '正在部署'
    : deployment.conclusion === 'success'
      ? '最近部署成功'
      : '最近部署失败';
  return (
    <a
      className={`${styles.deployStatus} ${variant}`}
      href={deployment.html_url}
      target="_blank"
      rel="noreferrer"
    >
      <span />
      {text}
    </a>
  );
}