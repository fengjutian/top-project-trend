import React, {lazy, Suspense} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import { 
  Moon, Sun, Search, User,  
 ChevronDown 
} from 'lucide-react';

import NosieTitle from '../custom-theme/noise-title';

const Silk = lazy(() => import('../MainPage/Silk'));
const SnowfallBg = lazy(() => import('../custom-theme/snow-fall'));

function AnimatedBackground() {
  const [shouldAnimate, setShouldAnimate] = React.useState(true);
  const [canLoad, setCanLoad] = React.useState(false);

  React.useEffect(() => {
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

  React.useEffect(() => {
    if (!shouldAnimate) {
      return undefined;
    }

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(() => setCanLoad(true), {
        timeout: 1500,
      });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(() => setCanLoad(true), 500);
    return () => window.clearTimeout(timeoutId);
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
  const { siteConfig } = useDocusaurusContext();
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  return (

<>

    {/* <BlurText
      text="Isn't this so cool?!"
      delay={150}
      animateBy="words"
      direction="top"
      onAnimationComplete={handleAnimationComplete}
      className="text-2xl mb-8"
    /> */}

       <header className={styles.header}>
        <div className={styles.headerContainer}>
          {/* <Link to="/" className={styles.logo}> */}
            <NosieTitle title={siteConfig.title}/>
          {/* </Link> */}

          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} />
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
              <User className={styles.userIcon} />
              <ChevronDown className={styles.chevronIcon} />
            </div>
            <button
              onClick={toggleDarkMode}
              className={styles.themeToggle}
              aria-label={isDarkMode ? '切换到亮色模式' : '切换到暗色模式'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </nav>
        </div>
      </header>


    <div className={styles.heroBackground}>
      <BrowserOnly fallback={<div className={styles.staticBackground} />}>
        {() => <AnimatedBackground />}
      </BrowserOnly>
    </div>


  </>
  );
}
