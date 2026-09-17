// Shown when no GitHub token is in sessionStorage. Manages its own input
// state and only emits the token when the user clicks the connect button.

import {useState} from 'react';
import styles from '../../pages/admin/styles.module.css';

export default function ConnectCard({onConnect}) {
  const [token, setToken] = useState('');
  return (
    <div className={styles.connectCard}>
      <div className={styles.eyebrow}>CONTENT STUDIO</div>
      <h1>连接 GitHub</h1>
      <p>使用只授权当前仓库 Contents 读写权限的 Fine-grained Token。Token 仅保存在当前浏览器会话，关闭标签页后清除。</p>
      <input
        type="password"
        value={token}
        onChange={(event) => setToken(event.target.value)}
        placeholder="github_pat_..."
      />
      <button
        type="button"
        onClick={() => onConnect(token.trim())}
        disabled={!token.trim()}
      >
        进入管理后台
      </button>
    </div>
  );
}