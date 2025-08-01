import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: '📚 技术分享',
    icon: '🚀',
    description: (
      <>
        分享最新的技术趋势、开源项目和开发工具，帮助开发者了解行业动态，
        提升技术视野。
      </>
    ),
  },
  {
    title: '🔍 项目发现',
    icon: '💡',
    description: (
      <>
        精选优质的开源项目，从实用工具到创新框架，为开发者提供灵感和参考，
        助力项目开发。
      </>
    ),
  },
  {
    title: '🌐 社区交流',
    icon: '🤝',
    description: (
      <>
        与技术社区保持紧密联系，分享经验、交流想法，共同推动技术发展，
        构建更好的开发生态。
      </>
    ),
  },
];

function Feature({icon, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <div className={styles.featureIcon}>
          <span className={styles.iconEmoji}>{icon}</span>
        </div>
        <div className={styles.featureContent}>
          <h3 className={styles.featureTitle}>{title}</h3>
          <p className={styles.featureDescription}>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>为什么选择我们</h2>
          <p className={styles.sectionSubtitle}>
            专注于技术分享，为开发者提供有价值的内容
          </p>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
