import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';
import { motion } from 'framer-motion';
import { ArrowRight, Github, Code, TrendingUp, BookOpen, Heart, Moon, Sun } from 'lucide-react';

const features = [
  {
    icon: <Code className="w-8 h-8" />,
    title: '精选开源项目',
    desc: '每周更新优质开源项目，涵盖前端、后端、工具库等多个领域。',
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: '技术趋势分析',
    desc: '深入解析前沿技术动态，帮助你把握行业发展方向。',
  },
  {
    icon: <BookOpen className="w-8 h-8" />,
    title: '实战教程',
    desc: '提供实用技术教程，从入门到精通，提升你的开发技能。',
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main className={styles.main}>
        {/* Theme Toggle */}
        <button 
          onClick={toggleDarkMode}
          className={styles.themeToggle}
          aria-label={isDarkMode ? '切换到亮色模式' : '切换到暗色模式'}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <motion.div 
              className={styles.heroContent}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.h1 
                className={styles.heroTitle}
                variants={itemVariants}
              >
                {siteConfig.title}
              </motion.h1>
              <motion.p 
                className={styles.heroDesc}
                variants={itemVariants}
              >
                {siteConfig.tagline}
              </motion.p>
              <motion.div 
                className={styles.heroButtons}
                variants={itemVariants}
              >
                <Link 
                  className={clsx('button', styles.primaryButton)} 
                  to="/blog"
                >
                  浏览周刊 <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                <Link 
                  className={clsx('button', styles.secondaryButton)} 
                  to="https://github.com/fengjutian/top-project-trend" 
                  target="_blank"
                >
                  <Github className="mr-2 w-4 h-4" /> GitHub
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.featuresSection}>
          <div className={styles.container}>
            <motion.div 
              className={styles.featuresGrid}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
            >
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  className={styles.featureCard}
                  variants={itemVariants}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className={styles.featureIcon}>{feature.icon}</div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDesc}>{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className={styles.newsletterSection}>
          <div className={styles.container}>
            <motion.div 
              className={styles.newsletterContent}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className={styles.newsletterTitle}>订阅技术周刊</h2>
              <p className={styles.newsletterDesc}>获取最新技术资讯和开源项目推荐，直接发送到您的邮箱</p>
              <div className={styles.newsletterForm}>
                <input
                  type="email"
                  placeholder="输入您的邮箱地址"
                  className={styles.newsletterInput}
                />
                <button className={clsx('button', styles.newsletterButton)}>
                  订阅 <Heart className="ml-2 w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
