import React, {lazy, Suspense, useEffect, useState, type SVGProps, type ComponentType} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import {
  Moon, Sun, Search, User,
  ChevronDown,
} from 'lucide-react';

import NosieTitle from '../custom-theme/noise-title';

const Silk = lazy(() => import('../MainPage/Silk'));
const SnowfallBg = lazy(() => import('../custom-theme/snow-fall'));

// lucide-react's icon types include `ReactNode` (which is wider than React 17's
// JSX.Element). Cast them to a JSX-compatible component so strict checks pass.
type Icon = ComponentType<SVGProps<SVGSVGElement> & {className?: string}>;
const SearchIcon = Search as unknown as Icon;
const SunIcon = Sun as unknown as Icon;
const MoonIcon = Moon as unknown as Icon;
const UserIcon = User as unknown as Icon;
const ChevronDownIcon = ChevronDown as unknown as Icon;

function AnimatedBackground() {
  const [shouldAnimate, setShouldAnimate] = useState<boolean>(true);
  const [canLoad, setCanLoad] = useState<boolean>(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateAnimationState = () => {
      setShouldAnimate(!reducedMotion.matches && !document.hidden);
    };

    updateAnimationState();
    reducedMotion.addEventListener('change', updateAnimationState);
    document.addEventListener('visibilitychange', updateAnimationState);

    return () => {
      reducedMotion.removeEventListener('change', updateAnimationState);
      document.removeEventListener('visibilitychange', updateAnimationState);
    };
  }, []);

  useEffect(() => {
    if (!shouldAnimate) {
      return undefined;
    }

    if ('requestIdleCallback' in window) {
      const idleId = (window as unknown as {requestIdleCallback: (cb: () => void, opts?: {timeout?: number}) => number}).requestIdleCallback(() => setCanLoad(true), {timeout: 1500});
      return () => (window as unknown as {cancelIdleCallback: (id: number) => void}).cancelIdleCallback(idleId);
    }

    const timeoutId = setTimeout(() => setCanLoad(true), 500);
    return () => clearTimeout(timeoutId);
  }, [shouldAnimate]);

  if (!shouldAnimate || !canLoad) {
    return <div className={styles.staticBackground} />;
  }

  return (
    <Suspense fallback={<div className={styles.staticBackground} />}>
      <Silk
        speed={5}
        scale={1}
        color="#5033F1FF"
        noiseIntensity={1.5}
        rotation={0}
      />
      <SnowfallBg />
    </Suspense>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    document.documentElement.classList.add('home-page-no-scroll');
    document.body.classList.add('home-page-no-scroll');

    return () => {
      document.documentElement.classList.remove('home-page-no-scroll');
      document.body.classList.remove('home-page-no-scroll');
    };
  }, []);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  return (
    <Layout title="首页" description="每周精选值得关注的技术趋势与开源项目">

      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <NosieTitle title={siteConfig.title}/>

          <div className={styles.searchBar}>
            <SearchIcon className={styles.searchIcon} />
            <input
              type="text"
              placeholder="搜索项目、标签或用户..."
              className={styles.searchInput}
            />
          </div>

          <nav className={styles.nav}>
            <Link to="/blog" className={styles.navLink}>博客</Link>
            <Link to="/algorithm" className={styles.navLink}>算法</Link>
            <Link to="/python" className={styles.navLink}>Python</Link>
            <Link to="/lang-chain" className={styles.navLink}>LangChain</Link>
            <div className={styles.userMenu}>
              <UserIcon className={styles.userIcon} />
              <ChevronDownIcon className={styles.chevronIcon} />
            </div>
            <button
              type="button"
              onClick={toggleDarkMode}
              className={styles.themeToggle}
              aria-label={isDarkMode ? '切换到亮色模式' : '切换到暗色模式'}
            >
              {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
          </nav>
        </div>
      </header>

      <div className={styles.heroBackground}>
        <BrowserOnly fallback={<div className={styles.staticBackground} />}>
          {() => <AnimatedBackground />}
        </BrowserOnly>

        <main className={styles.heroContent}>
          <div className={styles.heroPanel}>
            <span className={styles.heroEyebrow}>每周发现值得关注的技术与开源项目</span>
            <h1 className={styles.heroTitle}>把技术趋势，变成你的下一步行动</h1>
            <p className={styles.heroDescription}>
              精选开发工具、开源项目、AI 应用与工程实践，用更少时间掌握真正有价值的新方向。
            </p>

            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} to="/blog">
                浏览最新周刊
              </Link>
              <Link className={styles.secondaryAction} to="/static-website">
                探索资源网站
              </Link>
            </div>

            <nav className={styles.heroTopics} aria-label="热门技术分类">
              <span>热门方向</span>
              <Link to="/llm">AI / LLM</Link>
              <Link to="/ts">TypeScript</Link>
              <Link to="/python">Python</Link>
              <Link to="/golang">Golang</Link>
            </nav>
          </div>
        </main>
      </div>

    </Layout>
  );
}