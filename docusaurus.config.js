// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const {themes: prismThemes} = require('prism-react-renderer');
const lightCodeTheme = prismThemes.github;
const darkCodeTheme = prismThemes.dracula;

const config = {
  title: 'fengjutian 技术周刊',
  tagline: '分享最新技术趋势和开源项目',
  url: 'https://fengjutian.github.io',
  baseUrl: '/top-project-trend/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/dinosaur-favicon.svg',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'fengjutian', // Usually your GitHub org/user name.
  projectName: 'top-project-trend', // Usually your repo name.
  deploymentBranch: 'gh-pages',
  plugins: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['en', 'zh'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        indexBlog: true,
        indexDocs: true,
        indexPages: true,
        blogDir: [
          'content/blog',
          'content/java',
          'content/code',
          'content/ts',
          'content/algorithm',
          'content/golang',
          'content/rust',
          'content/python',
          'content/android',
          'content/lang-chain',
          'content/mcp',
          'content/llm',
          'content/static-website',
        ],
        // 启用开发环境下的搜索功能
        docsRouteBasePath: '/docs',
        blogRouteBasePath: '/blog',
      },
    ],
    ['@docusaurus/plugin-content-blog',
      {
        id: 'java',
        path: 'content/java',
        routeBasePath: 'java',
        showReadingTime: true,
        blogSidebarCount: 100,
          onUntruncatedBlogPosts: 'ignore',
        editUrl:
          'https://github.com/fengjutian/top-project-trend/tree/main',
      },
    ],
    ['@docusaurus/plugin-content-blog',
      {
        id: 'code',
        path: 'content/code',
        routeBasePath: 'code',
        showReadingTime: true,
        blogSidebarCount: 100,
          onUntruncatedBlogPosts: 'ignore',
        editUrl:
          'https://github.com/fengjutian/top-project-trend/tree/main',
      },
    ],
    ['@docusaurus/plugin-content-blog',
      {
        id: 'ts',
        path: 'content/ts',
        routeBasePath: 'ts',
        showReadingTime: true,
        blogSidebarCount: 100,
          onUntruncatedBlogPosts: 'ignore',
        editUrl:
          'https://github.com/fengjutian/top-project-trend/tree/main',
      },
    ],
    ['@docusaurus/plugin-content-blog',
      {
        id: 'algorithm',
        path: 'content/algorithm',
        routeBasePath: 'algorithm',
        showReadingTime: true,
        blogSidebarCount: 100,
          onUntruncatedBlogPosts: 'ignore',
        editUrl:
          'https://github.com/fengjutian/top-project-trend/tree/main',
      },
    ],
    ['@docusaurus/plugin-content-blog',
      {
        id: 'golang',
        path: 'content/golang',
        routeBasePath: 'golang',
        showReadingTime: true,
        blogSidebarCount: 100,
          onUntruncatedBlogPosts: 'ignore',
        editUrl:
          'https://github.com/fengjutian/top-project-trend/tree/main',
      },
    ],

    ['@docusaurus/plugin-content-blog',
      {
        id: 'rust',
        path: 'content/rust',
        routeBasePath: 'rust',
        showReadingTime: true,
        blogSidebarCount: 100,
          onUntruncatedBlogPosts: 'ignore',
        editUrl:
          'https://github.com/fengjutian/top-project-trend/tree/main',
      },
    ],
    ['@docusaurus/plugin-content-blog',
      {
        id: 'python',
        path: 'content/python',
        routeBasePath: 'python',
        showReadingTime: true,
        blogSidebarCount: 100,
          onUntruncatedBlogPosts: 'ignore',
        editUrl:
          'https://github.com/fengjutian/top-project-trend/tree/main',
      },
    ],
    ['@docusaurus/plugin-content-blog',
      {
        id: 'android',
        path: 'content/android',
        routeBasePath: 'android',
        showReadingTime: true,
        blogSidebarCount: 100,
          onUntruncatedBlogPosts: 'ignore',
        editUrl:
          'https://github.com/fengjutian/top-project-trend/tree/main',
      },
    ],
    ['@docusaurus/plugin-content-blog',
      {
        id: 'LangChain',
        path: 'content/lang-chain',
        routeBasePath: 'lang-chain',
        showReadingTime: true,
        blogSidebarCount: 100,
          onUntruncatedBlogPosts: 'ignore',
        editUrl:
          'https://github.com/fengjutian/top-project-trend/tree/main',
      },
    ],
    ['@docusaurus/plugin-content-blog',
      {
        id: 'mcp',
        path: 'content/mcp',
        routeBasePath: 'mcp',
        showReadingTime: true,
        blogSidebarCount: 100,
          onUntruncatedBlogPosts: 'ignore',
        editUrl:
          'https://github.com/fengjutian/top-project-trend/tree/main',
      },
    ],
    ['@docusaurus/plugin-content-blog',
      {
        id: 'llm',
        path: 'content/llm',
        routeBasePath: 'llm',
        showReadingTime: true,
        blogSidebarCount: 100,
          onUntruncatedBlogPosts: 'ignore',
        editUrl:
          'https://github.com/fengjutian/top-project-trend/tree/main',
      },
    ],
    ['@docusaurus/plugin-content-blog',
      {
        id: 'static-website',
        path: 'content/static-website',
        routeBasePath: 'static-website',
        showReadingTime: true,
        blogSidebarCount: 100,
          onUntruncatedBlogPosts: 'ignore',
        blogSidebarTitle: '静态网站',
        editUrl:
          'https://github.com/fengjutian/top-project-trend/tree/main',
      },
    ],

  ],
  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarCollapsible: false,
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/fengjutian/top-project-trend/tree/main',
        },
        blog: {
          path: 'content/blog',
          showReadingTime: true,
          blogSidebarTitle: '博文',
          blogSidebarCount: 100,
          onUntruncatedBlogPosts: 'ignore',
          editUrl:
            'https://github.com/fengjutian/top-project-trend/tree/main',
        },
        // 'static-website': {
        //   showReadingTime: true,
        //   blogSidebarTitle: '静态网站',
        //   blogSidebarCount: 'ALL',
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   editUrl:
        //     'https://github.com/fengjutian/top-project-trend/tree/main',
        // },
        // 移除下面这部分
        // algorithm: {
        //   path: 'algorithm',
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   editUrl:
        //     'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        // },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'fengjutian 技术周刊',
        logo: {
          alt: 'fengjutian 技术周刊 Logo',
          src: 'img/dinosaur-cute.svg',
        },
        items: [
          {to: '/blog', label: '周刊', position: 'left'},
          {
            type: 'dropdown',
            label: '技术分类',
            position: 'left',
            items: [
              {to: '/java', label: 'Java'},
              {to: '/code', label: '代码'},
              {to: '/ts', label: 'TypeScript'},
              {to: '/algorithm', label: '算法'},
              {to: '/golang', label: 'Golang'},
              {to: '/rust', label: 'Rust'},
              {to: '/python', label: 'Python'},
              {to: '/android', label: 'Android / Flutter'},
            ],
          },
          {
            type: 'dropdown',
            label: 'AI',
            position: 'left',
            items: [
              {to: '/mcp', label: 'MCP'},
              {to: '/llm', label: 'LLM'},
            ],
          },
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Tutorial',
          },
          {to: '/static-website', label: '资源网站', position: 'left'},
          {
            href: 'https://github.com/fengjutian',
            label: 'GitHub',
            position: 'right',
          },
          {
            type: 'search',
            position: 'right',
          },
        ],
      },
      // footer: {
      //   style: 'dark',
      //   links: [
      //     {
      //       title: 'Docs',
      //       items: [
      //         {
      //           label: 'Tutorial',
      //           to: '/docs/intro',
      //         },
      //       ],
      //     },
      //     {
      //       title: 'Community',
      //       items: [
      //         {
      //           label: 'Stack Overflow',
      //           href: 'https://stackoverflow.com/questions/tagged/docusaurus',
      //         },
      //         {
      //           label: 'Discord',
      //           href: 'https://discordapp.com/invite/docusaurus',
      //         },
      //         {
      //           label: 'Twitter',
      //           href: 'https://twitter.com/docusaurus',
      //         },
      //       ],
      //     },
      //     {
      //       title: 'More',
      //       items: [
      //         {
      //           label: 'Blog',
      //           to: '/blog',
      //         },
      //         {
      //           label: 'GitHub',
      //           href: 'https://github.com/facebook/docusaurus',
      //         },
      //       ],
      //     },
      //   ],
      //   copyright: `Copyright © ${new Date().getFullYear()} fengjutian. Built with Docusaurus.`,
      // },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
