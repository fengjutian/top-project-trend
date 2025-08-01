# fengjutian 技术周刊

![首页预览](static/img/fengjutian-animated.svg)

> 现代化开源项目趋势周刊，探索前端技术前沿，分享开源生态动态，打造极致阅读体验。

## 项目愿景

我们致力于打造一个集技术资讯、开源趋势、动效设计于一体的综合性技术平台。通过简洁优雅的界面设计、流畅的动画效果和优质的内容输出，为开发者提供有价值的技术参考和灵感来源。

## 核心特色

<div style="display: flex; flex-wrap: wrap; gap: 1.5rem; margin: 2rem 0;">
  <div style="flex: 1; min-width: 250px; background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 8px;">
    <h3 style="margin-top: 0; display: flex; align-items: center;">🦕 恐龙吉祥物</h3>
    <p>可爱独特的恐龙形象，成为品牌的标志性符号，为技术内容增添趣味性。</p>
  </div>
  <div style="flex: 1; min-width: 250px; background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 8px;">
    <h3 style="margin-top: 0; display: flex; align-items: center;">🌌 极光动画背景</h3>
    <p>采用 SVG+CSS 实现的流动渐变极光效果，创造沉浸式阅读体验，灵感源自 vue-bits.dev。</p>
  </div>
  <div style="flex: 1; min-width: 250px; background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 8px;">
    <h3 style="margin-top: 0; display: flex; align-items: center;">⚡ 高性能体验</h3>
    <p>响应式设计、暗黑模式支持、PWA 功能，确保在各种设备上都能获得流畅体验。</p>
  </div>
</div>

## 技术栈

本项目基于以下技术构建：

- <strong>Docusaurus 2</strong>：强大的静态站点生成器
- <strong>React</strong>：用于构建用户界面的 JavaScript 库
- <strong>Framer Motion</strong>：流畅的动画效果实现
- <strong>SVG</strong>：矢量图形，确保清晰度和性能
- <strong>MDX</strong>：增强的 Markdown，支持组件嵌入

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发（启动开发服务器）
npm run start

# 构建生产环境
npm run build

# 本地预览生产构建
npm run serve
```

## 目录结构

```
├── src/pages/index.js         # 首页主视觉与极光动画
├── src/pages/AuroraBackground.js  # 极光动画 SVG 组件
├── static/img/               # 静态资源，包括恐龙吉祥物 SVG
├── blog/                     # 技术周刊内容
├── docs/                     # 文档教程
├── docusaurus.config.js      # 项目配置文件
└── package.json              # 依赖管理
```

## 部署指南

项目支持多种部署方式，以下是 GitHub Pages 部署步骤：

```shell
# 配置 SSH（可选，但推荐）
$env:USE_SSH="true"

# 配置 GitHub 用户名
$env:GIT_USER="你的GitHub用户名"

# 部署到 GitHub Pages
yarn deploy
```

## 贡献指南

欢迎对项目进行贡献！无论是内容更新、bug 修复还是功能增强，都可以通过以下步骤参与：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/fooBar`)
3. 提交更改 (`git commit -am 'Add some fooBar'`)
4. 推送到分支 (`git push origin feature/fooBar`)
5. 创建新的 Pull Request

## 许可协议

本项目采用 MIT 许可证，详情请见 [LICENSE](LICENSE) 文件。

---

由 [fengjutian](https://github.com/fengjutian) 设计与维护

[![GitHub stars](https://img.shields.io/github/stars/fengjutian/top-project-trend.svg?style=social&label=Star)](https://github.com/fengjutian/top-project-trend)