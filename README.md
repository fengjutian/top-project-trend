# fengjutian 技术周刊

![首页预览](static/img/fengjutian-animated.svg)

> 现代化开源项目趋势周刊，探索前端技术前沿，分享开源生态动态，打造极致阅读体验。

## 项目简介

fengjutian技术周刊是一个专注于前端技术与开源生态的综合性技术平台，致力于为开发者提供最新的技术资讯、开源趋势分析和优质的学习资源。通过精心设计的用户界面和流畅的阅读体验，帮助开发者紧跟技术发展潮流。

## 项目愿景

我们的目标是构建一个集技术资讯、开源趋势、动效设计于一体的高质量技术社区。通过简洁优雅的界面设计、流畅的动画效果和优质的内容输出，为开发者提供有价值的技术参考和灵感来源，助力技术成长与知识分享。

## 核心特色

<div style="display: flex; flex-wrap: wrap; gap: 1.5rem; margin: 2rem 0;">
  <div style="flex: 1; min-width: 250px; background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 8px;">
    <h3 style="margin-top: 0; display: flex; align-items: center;">🦕 恐龙吉祥物</h3>
    <p>可爱独特的恐龙形象，成为品牌的标志性符号，为技术内容增添趣味性与识别度。</p>
  </div>
  <div style="flex: 1; min-width: 250px; background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 8px;">
    <h3 style="margin-top: 0; display: flex; align-items: center;">🌌 极光动画背景</h3>
    <p>采用 SVG+CSS 实现的流动渐变极光效果，创造沉浸式阅读体验，灵感源自 vue-bits.dev。</p>
  </div>
  <div style="flex: 1; min-width: 250px; background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 8px;">
    <h3 style="margin-top: 0; display: flex; align-items: center;">⚡ 高性能体验</h3>
    <p>响应式设计、暗黑模式支持、PWA 功能，确保在各种设备上都能获得流畅的用户体验。</p>
  </div>
</div>

## 技术栈

本项目基于现代前端技术栈构建，主要包括：

- <strong>Docusaurus 2</strong>：强大的静态站点生成器，提供完整的文档站点功能
- <strong>React</strong>：用于构建用户界面的 JavaScript 库，提供组件化开发能力
- <strong>Framer Motion</strong>：流畅的动画效果实现，提升用户体验
- <strong>SVG</strong>：矢量图形技术，确保界面清晰度和高性能
- <strong>MDX</strong>：增强的 Markdown，支持在文档中嵌入 React 组件
- <strong>@easyops-cn/docusaurus-search-local</strong>：提供本地化搜索功能

## 快速开始

### 环境准备

- Node.js (v14.0.0 或更高版本)
- npm/yarn/pnpm 包管理器

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/fengjutian/top-project-trend.git
cd top-project-trend

# 安装依赖
npm install
# 或使用 yarn
# yarn install
# 或使用 pnpm
# pnpm install

# 本地开发（启动开发服务器）
npm run start
# 或
# yarn start
# 或
# pnpm start

# 构建生产环境
npm run build
# 或
# yarn build
# 或
# pnpm build

# 本地预览生产构建
npm run serve
# 或
# yarn serve
# 或
# pnpm serve
```

开发服务器启动后，访问 http://localhost:3000/top-project-trend/ 即可查看站点。

## 目录结构

项目采用清晰的目录结构，便于维护和扩展：

```
├── src/pages/index.js          # 首页主视觉与极光动画
├── src/pages/AuroraBackground.js # 极光动画 SVG 组件
├── static/img/                 # 静态资源，包括恐龙吉祥物 SVG
├── blog/                       # 技术周刊内容（按分类组织）
│   ├── java/                   # Java 技术相关文章
│   ├── code/                   # 编程技巧相关文章
│   ├── ts/                     # TypeScript 相关文章
│   └── ...                     # 其他分类
├── docs/                       # 文档教程
├── docusaurus.config.js        # 项目配置文件
├── package.json                # 依赖管理
└── README.md                   # 项目说明文档
```

## 搜索功能

本项目集成了本地搜索功能，支持中英文搜索、结果高亮等特性。使用前需注意：

- 在开发环境中，需要先运行 `npm run build` 生成搜索索引
- 搜索功能在生产环境中默认可用

## 部署指南

项目支持多种部署方式，以下是 GitHub Pages 部署步骤（Windows 环境）：

```powershell
# 配置 SSH（可选，但推荐）
$env:USE_SSH="true"

# 配置 GitHub 用户名
$env:GIT_USER="你的GitHub用户名"

# 部署到 GitHub Pages
npm run deploy
# 或
# yarn deploy
# 或
# pnpm deploy
```

部署成功后，站点将可通过 https://你的用户名.github.io/top-project-trend/ 访问。

## 贡献指南

我们欢迎并感谢社区的贡献！无论是内容更新、bug 修复还是功能增强，都可以通过以下步骤参与：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/your-feature`)
3. 提交更改 (`git commit -am 'Add some feature'`)
4. 推送到分支 (`git push origin feature/your-feature`)
5. 创建新的 Pull Request

## 许可协议

本项目采用 MIT 许可证，详情请见 [LICENSE](LICENSE) 文件。

---

由 [fengjutian](https://github.com/fengjutian) 设计与维护

[![GitHub stars](https://img.shields.io/github/stars/fengjutian/top-project-trend.svg?style=social&label=Star)](https://github.com/fengjutian/top-project-trend)
        