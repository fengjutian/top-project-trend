// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
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
      '@docusaurus/plugin-pwa',
      {
        debug: true,
        offlineModeActivationStrategies: [
          'appInstalled',
          'standalone',
          'queryString',
        ],
        pwaHead: [
          {
            tagName: 'link',
            rel: 'icon',
            href: '/img/docusaurus.png',
          },
          {
            tagName: 'link',
            rel: 'manifest',
            href: '/manifest.json', // your PWA manifest
          },
          {
            tagName: 'meta',
            name: 'theme-color',
            content: 'rgb(37, 194, 160)',
          },
        ],
      },
    ],
    ['@docusaurus/plugin-content-blog',
      {
        id: 'java',
        path: 'java',
        routeBasePath: 'java',
        showReadingTime: true,
        editUrl:
          'https://github.com/fengjutian/top-project-trend/tree/main',
      },
    ],
    ['@docusaurus/plugin-content-blog',
      {
        id: 'code',
        path: 'code',
        routeBasePath: 'code',
        showReadingTime: true,
        editUrl:
          'https://github.com/fengjutian/top-project-trend/tree/main',
      },
    ],
    ['@docusaurus/plugin-content-blog',
      {
        id: 'ts',
        path: 'ts',
        routeBasePath: 'ts',
        showReadingTime: true,
        editUrl:
          'https://github.com/fengjutian/top-project-trend/tree/main',
      },
    ],
    ['@docusaurus/plugin-content-blog',
      {
        id: 'algorithm',
        path: 'algorithm',
        routeBasePath: 'algorithm',
        showReadingTime: true,
        editUrl:
          'https://github.com/fengjutian/top-project-trend/tree/main',
      },
    ],
    ['@docusaurus/plugin-content-blog',
      {
        id: 'golang',
        path: 'golang',
        routeBasePath: 'golang',
        showReadingTime: true,
        editUrl:
          'https://github.com/fengjutian/top-project-trend/tree/main',
      },
    ],

    ['@docusaurus/plugin-content-blog',
      {
        id: 'rust',
        path: 'rust',
        routeBasePath: 'rust',
        showReadingTime: true,
        editUrl:
          'https://github.com/fengjutian/top-project-trend/tree/main',
      },
    ],
    ['@docusaurus/plugin-content-blog',
      {
        id: 'python',
        path: 'python',
        routeBasePath: 'python',
        showReadingTime: true,
        editUrl:
          'https://github.com/fengjutian/top-project-trend/tree/main',
      },
    ],
    ['@docusaurus/plugin-content-blog',
      {
        id: 'android',
        path: 'android',
        routeBasePath: 'android',
        showReadingTime: true,
        editUrl:
          'https://github.com/fengjutian/top-project-trend/tree/main',
      },
    ],
    ['@docusaurus/plugin-content-blog',
      {
        id: 'LangChain',
        path: 'lang-chain',
        routeBasePath: 'lang-chain',
        showReadingTime: true,
        editUrl:
          'https://github.com/fengjutian/top-project-trend/tree/main',
      },
    ],
    ['@docusaurus/plugin-content-blog',
      {
        id: 'mcp',
        path: 'mcp',
        routeBasePath: 'mcp',
        showReadingTime: true,
        editUrl:
          'https://github.com/fengjutian/top-project-trend/tree/main',
      },
    ],
    ['@docusaurus/plugin-content-blog',
      {
        id: 'llm',
        path: 'llm',
        routeBasePath: 'llm',
        showReadingTime: true,
        editUrl:
          'https://github.com/fengjutian/top-project-trend/tree/main',
      },
    ],
    ['@docusaurus/plugin-content-blog',
      {
        id: 'static-website',
        path: 'static-website',
        routeBasePath: 'static-website',
        showReadingTime: true,
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

          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          blogSidebarTitle: '博文',
          blogSidebarCount: 'ALL',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
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
          alt: 'fengjutian 技术周刊',
          src: 'img/dinosaur-cute.svg',
        },
        items: [
          {to: '/blog', label: '周刊', position: 'left'},
          {to: '/java', label: 'Java', position: 'left'},
          {to: '/code', label: '代码', position: 'left'},
          {to: '/ts', label: 'TypeScript', position: 'left'},
          {to: '/algorithm', label: '算法', position: 'left'},
          {to: '/golang', label: 'Golang', position: 'left'},
          {to: '/rust', label: 'Rust', position: 'left'},
          {to: '/python', label: 'Python', position: 'left'},
          {to: '/android', label: 'Android/Flutter', position: 'left'},
          {to: '/mcp', label: 'MCP', position: 'left'},
          {to: '/llm', label: 'LLM', position: 'left'},
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
