import React from 'react';
import styles from './AuroraBackground.module.css';

export default function AuroraBackground() {
  return (
    <div className={styles.auroraBg} aria-hidden="true">
      <svg width="100%" height="100%" viewBox="0 0 1440 900" className={styles.auroraSvg}>
        <defs>
          <radialGradient id="aurora1" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="aurora2" cx="70%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="aurora3" cx="30%" cy="70%" r="60%">
            <stop offset="0%" stopColor="#f093fb" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse className={styles.aurora1} cx="720" cy="500" rx="600" ry="220" fill="url(#aurora1)" />
        <ellipse className={styles.aurora2} cx="1100" cy="200" rx="400" ry="180" fill="url(#aurora2)" />
        <ellipse className={styles.aurora3} cx="400" cy="700" rx="350" ry="140" fill="url(#aurora3)" />
      </svg>
    </div>
  );
} 