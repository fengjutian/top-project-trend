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



// 热门项目数据
// const projects = [
//   {
//     id: 1,
//     name: 'RustScan',
//     description: '现代化的端口扫描工具，速度比nmap快200倍',
//     tags: ['rust', 'security', 'networking'],
//     votes: 342,
//     comments: 28,
//     launchDate: '3天前',
//     icon: <Zap className="w-5 h-5 text-yellow-500" />,
//   },
//   {
//     id: 2,
//     name: 'VueBits',
//     description: 'Vue 3组件库，包含60+精心设计的UI组件',
//     tags: ['vue', 'ui', 'frontend'],
//     votes: 215,
//     comments: 15,
//     launchDate: '1周前',
//     icon: <Star className="w-5 h-5 text-blue-500" />,
//   },
//   {
//     id: 3,
//     name: 'FileBrowser',
//     description: '基于Web的文件管理器，支持多种存储后端',
//     tags: ['go', 'storage', 'web'],
//     votes: 187,
//     comments: 12,
//     launchDate: '2周前',
//     icon: <Flame className="w-5 h-5 text-red-500" />,
//   },
// ];

// 热门标签
// const popularTags = [
//   { name: 'javascript', count: 1245 },
//   { name: 'python', count: 987 },
//   { name: 'rust', count: 765 },
//   { name: 'vue', count: 654 },
//   { name: 'react', count: 543 },
//   { name: 'go', count: 432 },
//   { name: 'ai', count: 321 },
//   { name: 'database', count: 210 },
// ];

// Animation variants
// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.2,
//     },
//   },
// };

// const itemVariants = {
//   hidden: { y: 20, opacity: 0 },
//   visible: {
//     y: 0,
//     opacity: 1,
//     transition: {
//       duration: 0.5,
//       ease: "easeOut",
//     },
//   },
// };

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
    // <Layout title={siteConfig.title} description={siteConfig.tagline}>
    //   {/* 顶部导航栏 */}
    //   <header className={styles.header}>
    //     <div className={styles.headerContainer}>
    //       <Link to="/" className={styles.logo}>
    //         {siteConfig.title}
    //       </Link>
          
    //       <div className={styles.searchBar}>
    //         <Search className={styles.searchIcon} />
    //         <input 
    //           type="text" 
    //           placeholder="搜索项目、标签或用户..." 
    //           className={styles.searchInput}
    //         />
    //       </div>
          
    //       <nav className={styles.nav}>
    //         <Link to="/blog" className={styles.navLink}>博客</Link>
    //         <Link to="/algorithm" className={styles.navLink}>算法</Link>
    //         <Link to="/python" className={styles.navLink}>Python</Link>
    //         <Link to="/lang-chain" className={styles.navLink}>LangChain</Link>
    //         <div className={styles.userMenu}>
    //           <User className={styles.userIcon} />
    //           <ChevronDown className={styles.chevronIcon} />
    //         </div>
    //         <button 
    //           onClick={toggleDarkMode}
    //           className={styles.themeToggle}
    //           aria-label={isDarkMode ? '切换到亮色模式' : '切换到暗色模式'}
    //         >
    //           {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    //         </button>
    //       </nav>
    //     </div>
    //   </header>

    //   <main className={styles.main}>
    //     <div className={styles.layout}>
    //       {/* 主要内容区 */}
    //       <div className={styles.content}>
    //         <div className={styles.contentHeader}>
    //           <h1 className={styles.contentTitle}>热门项目</h1>
    //           <div className={styles.sortOptions}>
    //             <span className={styles.sortOptionActive}>最新</span>
    //             <span className={styles.sortOption}>热门</span>
    //             <span className={styles.sortOption}>最多评论</span>
    //           </div>
    //         </div>

    //         {/* 项目列表 */}
    //         <div className={styles.projectsList}>
    //           {projects.map((project) => (
    //             <motion.div 
    //               key={project.id} 
    //               className={styles.projectCard} 
    //               initial="hidden" 
    //               whileInView="visible" 
    //               variants={itemVariants} 
    //               whileHover={{ scale: 1.02 }} 
    //             >
    //               <div className={styles.projectHeader}>
    //                 <div className={styles.projectIcon}>{project.icon}</div>
    //                 <div className={styles.projectMeta}>
    //                   <h3 className={styles.projectName}>{project.name}</h3>
    //                   <div className={styles.projectLaunchDate}>
    //                     <Clock className={styles.clockIcon} />
    //                     <span>{project.launchDate}</span>
    //                   </div>
    //                 </div>
    //               </div>
    //               <p className={styles.projectDescription}>{project.description}</p>
    //               <div className={styles.projectTags}>
    //                 {project.tags.map((tag) => (
    //                   <span key={tag} className={styles.projectTag}>
    //                     #{tag}
    //                   </span>
    //                 ))}
    //               </div>
    //               <div className={styles.projectStats}>
    //                 <div className={styles.statItem}>
    //                   <MessageSquare className={styles.statIcon} />
    //                   <span>{project.comments}</span>
    //                 </div>
    //                 <div className={styles.statItem}>
    //                   <Heart className={styles.statIcon} />
    //                   <span>{project.votes}</span>
    //                 </div>
    //               </div>
    //             </motion.div>
    //           ))}
    //         </div>
    //       </div>

    //       {/* 侧边栏 */}
    //       <aside className={styles.sidebar}>
    //         <div className={styles.sidebarSection}>
    //           <h3 className={styles.sidebarTitle}>热门标签</h3>
    //           <div className={styles.tagsList}>
    //             {popularTags.map((tag) => (
    //               <Link 
    //                 key={tag.name} 
    //                 to={`/blog`} 
    //                 className={styles.tagItem} 
    //               >
    //                 <Tag className={styles.tagIcon} />
    //                 <span className={styles.tagName}>#{tag.name}</span>
    //                 <span className={styles.tagCount}>{tag.count}</span>
    //               </Link>
    //             ))}
    //           </div>
    //         </div>

    //         <div className={styles.sidebarSection}>
    //           <h3 className={styles.sidebarTitle}>本周热门</h3>
    //           <div className={styles.topProjects}>
    //             {projects.slice(0, 3).map((project) => (
    //               <Link 
    //                   key={project.id} 
    //                   to={`/blog`} 
    //                   className={styles.topProjectItem} 
    //                 >
    //                 <div className={styles.topProjectIcon}>{project.icon}</div>
    //                 <div className={styles.topProjectInfo}>
    //                   <div className={styles.topProjectName}>{project.name}</div>
    //                   <div className={styles.topProjectVotes}>
    //                     <Heart className={styles.smallHeartIcon} />
    //                     <span>{project.votes}</span>
    //                   </div>
    //                 </div>
    //               </Link>
    //             ))}
    //           </div>
    //         </div>
    //       </aside>
    //     </div>

    //     {/* 页脚 */}
    //     <footer className={styles.footer}>
    //       <div className={styles.footerContainer}>
    //         <div className={styles.footerLinks}>
    //           <Link to="/blog" className={styles.footerLink}>博客</Link>
    //           <Link to="/algorithm" className={styles.footerLink}>算法</Link>
    //           <Link to="/python" className={styles.footerLink}>Python</Link>
    //           <Link to="/lang-chain" className={styles.footerLink}>LangChain</Link>
    //         </div>
    //         <div className={styles.footerCopyright}>
    //           © {new Date().getFullYear()} {siteConfig.title}. All rights reserved.
    //         </div>
    //       </div>
    //     </footer>
    //     <section className={styles.newsletterSection}>
    //       <div className={styles.container}>
    //         <motion.div 
    //           className={styles.newsletterContent}
    //           initial={{ opacity: 0, y: 30 }}
    //           whileInView={{ opacity: 1, y: 0 }}
    //           viewport={{ once: true }}
    //           transition={{ duration: 0.6 }}
    //         >
    //           <h2 className={styles.newsletterTitle}>订阅技术周刊</h2>
    //           <p className={styles.newsletterDesc}>获取最新技术资讯和开源项目推荐，直接发送到您的邮箱</p>
    //           <div className={styles.newsletterForm}>
    //             <input
    //               type="email"
    //               placeholder="输入您的邮箱地址"
    //               className={styles.newsletterInput}
    //             />
    //             <button className={clsx('button', styles.newsletterButton)}>
    //               订阅 <Heart className="ml-2 w-4 h-4" />
    //             </button>
    //           </div>
    //         </motion.div>
    //       </div>
    //     </section>
    //   </main>
    // </Layout>

<>

    {/* <BlurText
      text="Isn't this so cool?!"
      delay={150}
      animateBy="words"
      direction="top"
      onAnimationComplete={handleAnimationComplete}
      className="text-2xl mb-8"
    /> */}

    <Silk
      speed={5}
      scale={1}
      color="#7B7481"
      noiseIntensity={1.5}
      rotation={0}
    />
</>


  );
}
