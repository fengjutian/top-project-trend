# fengjutian 技术周刊

> 现代化开源项目趋势周刊，极光动画首页，恐龙吉祥物，极致简洁与高性能体验。

![首页预览](static/img/dinosaur-cute.svg)

## 项目简介

本项目基于 [Docusaurus 2](https://docusaurus.io/) 构建，聚焦于开源技术趋势、前端动效与极简美学。首页采用极光动画背景（Aurora）、可爱的恐龙吉祥物，灵感来自 [vue-bits.dev](https://vue-bits.dev/)。

- 🦕 恐龙吉祥物，极具辨识度
- 🌌 极光动画背景，沉浸式体验
- ⚡ 高性能、响应式、暗黑模式
- 📚 技术周刊内容，涵盖前端、开源、工具等
- 🎨 主题色彩可定制，支持 PWA

## 主要特性

- **极光动画首页**：SVG+CSS 实现流动渐变极光，灵感源自 vue-bits.dev
- **恐龙吉祥物**：自绘 SVG，动画可爱，品牌专属
- **三大特性卡片**：极致简洁 / 高性能 / 主题可定制
- **内容结构**：技术周刊、开源项目推荐、文档教程
- **PWA 支持**：离线可用，移动端体验佳

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发
npm run start

# 构建生产环境
npm run build
```

## 目录结构

- `src/pages/index.js` —— 首页主视觉与极光动画
- `src/pages/AuroraBackground.js` —— 极光动画 SVG 组件
- `static/img/dinosaur-cute.svg` —— 恐龙吉祥物
- `blog/` —— 技术周刊内容
- `docs/` —— 文档教程

## 部署

```shell
$env:USE_SSH="true"
yarn deploy

$env:GIT_USER="你的GitHub用户名"
yarn deploy
```

---

> 由 [fengjutian](https://github.com/fengjutian) 设计与维护