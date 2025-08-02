// ... existing code ...
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
  [
    '@docusaurus/plugin-content-blog',
    {
      id: 'algorithm',
      path: 'algorithm',
      routeBasePath: 'algorithm',
      showReadingTime: true,
      editUrl:
        'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
    },
  ],
  [
    '@docusaurus/plugin-content-blog',
    {
      id: 'rust',
      path: 'rust',
      routeBasePath: 'rust',
      showReadingTime: true,
      editUrl:
        'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
    },
  ],
  [
    '@docusaurus/plugin-content-blog',
    {
      id: 'python',
      path: 'python',
      routeBasePath: 'python',
      showReadingTime: true,
      editUrl:
        'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
    },
  ],
],
// ... existing code ...