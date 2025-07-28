import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const features = [
  {
    icon: '🦕',
    title: '极致简洁',
    desc: '专注于极简设计与高效体验，界面清爽，交互流畅，助你专注内容本身。',
  },
  {
    icon: '⚡',
    title: '高性能',
    desc: '基于现代前端技术栈，极速加载，动画丝滑，移动端与桌面端体验一致。',
  },
  {
    icon: '🌈',
    title: '主题可定制',
    desc: '支持多种主题色彩与暗黑模式，轻松适配你的品牌风格。',
  },
];

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroLeft}>
            <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
            <p className={styles.heroDesc}>{siteConfig.tagline}</p>
            <div className={styles.heroButtons}>
              <Link className={clsx('button', styles.primaryButton)} to="/blog">
                立即体验
              </Link>
              <Link className={clsx('button', styles.secondaryButton)} to="https://github.com/fengjutian/top-project-trend" target="_blank">
                GitHub
              </Link>
            </div>
          </div>
          <div className={styles.heroRight}>
            <img
              src={require('../../static/img/dinosaur-cute.svg').default}
              alt="Dinosaur Mascot"
              className={styles.heroDino}
            />
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.featuresSection}>
          <div className={styles.featuresGrid}>
            {features.map((f, i) => (
              <div className={styles.featureCard} key={i}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <div className={styles.featureTitle}>{f.title}</div>
                <div className={styles.featureDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
