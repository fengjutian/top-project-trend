import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <img
            src={require('@site/static/img/dinosaur-cute.svg').default}
            alt="logo"
            className={styles.heroLogo}
          />
          <h1 className={styles.gradientText}>Top Project Trend</h1>
          <p className={styles.heroSubtitle}>
            发现、追踪和分享最值得关注的开源项目与技术趋势。
          </p>
          <div className={styles.heroActions}>
            <Link className={clsx('button', styles.mainButton)} to="/blog">
              立即探索
            </Link>
            <a
              className={clsx('button', styles.ghButton)}
              href="https://github.com/fengjutian/top-project-trend"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span role="img" aria-label="github">🌟</span> GitHub
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

function HomepageCards() {
  // 极简卡片区块
  const cards = [
    {
      icon: '🦕',
      title: '开源项目周榜',
      desc: '每周精选开源项目，涵盖前端、后端、AI、工具库等领域。',
    },
    {
      icon: '⚡',
      title: '技术趋势追踪',
      desc: '追踪技术热点，聚焦社区讨论与创新实践。',
    },
    {
      icon: '🛠️',
      title: '开发者工具',
      desc: '推荐高效开发工具，提升你的生产力。',
    },
    {
      icon: '🌍',
      title: '全球社区',
      desc: '连接全球开发者，分享经验与灵感。',
    },
  ];
  return (
    <section className={styles.cardsSection}>
      <div className="container">
        <div className={styles.cardsGrid}>
          {cards.map((card, idx) => (
            <div className={styles.card} key={idx}>
              <div className={styles.cardIcon}>{card.icon}</div>
              <div className={styles.cardTitle}>{card.title}</div>
              <div className={styles.cardDesc}>{card.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - 技术周刊`}
      description="发现、追踪和分享最值得关注的开源项目与技术趋势">
      <HomepageHeader />
      <HomepageCards />
    </Layout>
  );
}
