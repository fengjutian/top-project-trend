# fengjutian 技术周刊

一个基于 Docusaurus 构建的中文技术内容站，聚合技术周刊、编程语言、AI、开源项目与开发资源。仓库同时内置单人内容管理后台，可直接在浏览器中管理 MDX 文章并提交到 GitHub。

![站点预览](static/img/fengjutian-animated.svg)

## 在线访问

- 站点：<https://fengjutian.github.io/top-project-trend/>
- 内容后台：<https://fengjutian.github.io/top-project-trend/admin>

后台面向仓库维护者，不提供多人账号系统。登录凭证使用 GitHub Fine-grained personal access token，并且只保存在当前标签页的 `sessionStorage` 中。

## 主要功能

### 内容站点

- 13 个内容栏目，文章统一存放在 `content/` 下
- 按发布日期倒序展示文章
- 支持 Markdown、MDX、自定义 React 组件和代码高亮
- 支持中英文全文搜索、深色模式、PWA 与响应式布局
- GitHub Pages 自动构建和发布

### Content Studio

访问 `/admin` 即可进入内置 CMS：

- 新建、编辑、复制、删除、搜索和筛选文章
- 草稿、发布、定时发布和自动下线
- 全部文章按时间倒序排列
- 标签、摘要、封面、链接标识和文章大纲管理
- 本地自动暂存、离开提醒和 Git SHA 冲突检测
- Git 历史版本查看与恢复
- 使用真实站点主题进行 MDX 预览
- 支持代码高亮、图片、`OptimizedVideo` 和站点自定义组件
- 图片上传、WebP 转换、压缩与媒体库复用
- 发布前内容检查与批量草稿/发布操作
- 全站仪表盘、发布日历、外链检查和媒体清理
- 最近一次 GitHub Actions 部署状态

后台保存后会通过 GitHub Contents API 直接提交到 `main` 分支，并触发自动部署。

## 技术栈

- Docusaurus 2
- React 17
- MDX
- Prism 代码高亮
- `@easyops-cn/docusaurus-search-local`
- GitHub Actions 与 GitHub Pages
- pnpm

## 本地开发

环境要求：Node.js 16.14 或更高版本、pnpm 9。

```bash
git clone https://github.com/fengjutian/top-project-trend.git
cd top-project-trend
pnpm install
pnpm dev
```

本地地址：

- 站点：<http://localhost:3000/top-project-trend/>
- 内容后台：<http://localhost:3000/top-project-trend/admin>

常用命令：

```bash
pnpm dev            # 启动开发服务器
pnpm build          # 生成生产构建
pnpm serve          # 本地预览生产构建
pnpm clear          # 清理 Docusaurus 缓存
```

## 使用后台

首次进入 `/admin` 时，需要填写 GitHub Fine-grained personal access token：

1. Repository access 只选择 `fengjutian/top-project-trend`。
2. Repository permissions 只开启 **Contents: Read and write**。
3. 将 Token 粘贴到后台连接窗口。

Token 不会写入源码、提交到 Git 或持久保存在服务器。关闭标签页或在后台退出后，当前会话中的 Token 会被清除。

后台常用快捷键：

- `Ctrl/Cmd + S`：保存文章
- `Ctrl/Cmd + K`：聚焦文章搜索
- `Ctrl/Cmd + Shift + P`：切换编辑与预览

## 本地写作

创建一篇默认处于草稿状态的文章：

```bash
pnpm article:new blog "文章标题"
```

文章 Front Matter 示例：

```yaml
---
title: 文章标题
slug: article-slug
date: 2026-09-17
authors: fengjutian
tags: [React, GitHub]
description: 文章摘要
image: /media/blog/2026/article-slug/cover.webp
draft: true
---
```

发布时将 `draft` 改为 `false`。所有栏目中的文章都应包含明确的 `date`，站点和后台均按日期倒序展示。

更多发布细节见 [文章发布指南](docs/publishing.md)。

## 内容与媒体工具

```bash
pnpm article:dates       # 检查或补齐文章日期
pnpm article:schedule    # 处理定时发布与自动下线
pnpm links:audit         # 检查文章外链
pnpm media:import -- ./image.png --article demo --section blog --year 2026 --purpose cover
pnpm media:audit         # 审计媒体引用、重复项和体积
pnpm media:audit:strict  # 严格模式媒体审计
```

导入图片时会生成适合网站使用的媒体文件。后台上传 PNG、JPEG 或 WebP 时，也会在浏览器中自动转换并压缩为 WebP。

## 自动化流程

仓库包含以下 GitHub Actions：

- `deploy.yml`：构建、媒体审计并部署 GitHub Pages
- `ci.yml`：持续集成检查
- `scheduled-publishing.yml`：每 15 分钟处理定时发布和自动下线
- `link-audit.yml`：定期检查全站外链，并生成后台可读取的报告

首次启用部署时，在 GitHub 仓库的 **Settings → Pages** 中将 **Build and deployment → Source** 设置为 **GitHub Actions**。

## 目录结构

```text
content/                     各栏目 MDX 文章
docs/                        站点说明文档
scripts/                     文章、外链和媒体维护脚本
src/pages/admin/             单人内容管理后台
static/media/                文章媒体资源
static/reports/              自动化检查报告
.github/workflows/           CI、部署与定时任务
.pages.yml                   Pages CMS 兼容配置
docusaurus.config.js         站点与栏目配置
```

## 发布

推送到 `main` 分支后，GitHub Actions 会执行媒体检查和生产构建；检查通过后自动发布到 GitHub Pages。

```bash
git add .
git commit -m "content: 发布文章标题"
git push
```

也可以运行 `pnpm deploy` 手动执行 Docusaurus 的部署流程。

## 安全说明

- 不要把 GitHub Token 写入代码、配置文件或提交记录。
- CMS 只需要目标仓库的 Contents 读写权限。
- 删除文章或媒体前会要求确认；Git 提交历史可用于恢复内容。
- 媒体清理结果属于静态分析，删除未引用文件前仍应人工复核。

---

由 [fengjutian](https://github.com/fengjutian) 维护。

[![GitHub stars](https://img.shields.io/github/stars/fengjutian/top-project-trend.svg?style=social&label=Star)](https://github.com/fengjutian/top-project-trend)
