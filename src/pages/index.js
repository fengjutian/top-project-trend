import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';
import { motion } from 'framer-motion';
import { 
  Heart, Moon, Sun, Search, User, Clock, Flame, 
  MessageSquare, Star, Zap, Tag, ChevronDown 
} from 'lucide-react';

import Silk from '../MainPage/Silk';

import BlurText from "../MainPage/BlurText";

const handleAnimationComplete = () => {
  console.log('Animation completed!');
};

import SnowfallBg from '../custom-theme/snow-fall';



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
          <Link to="/" className={styles.logo}>
            {siteConfig.title}
          </Link>

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



    <Silk
      speed={5}
      scale={1}
      color="#5033F1FF"
      noiseIntensity={1.5}
      rotation={0}
    />

    <SnowfallBg />
</>


  );
}
