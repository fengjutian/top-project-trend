---
sidebar_position: 8
title: 文章发布
---

# 文章发布

本站支持两种写作方式，文章最终都保存在 GitHub 仓库的 `content/` 目录中。

## 在 Pages CMS 中发布

1. 打开 [Pages CMS](https://app.pagescms.org/)，使用 GitHub 登录。
2. 为 `fengjutian/top-project-trend` 安装 Pages CMS GitHub App。
3. 选择仓库和 `main` 分支，然后进入“文章”栏目。
4. 新建文章时保持“草稿”开启，填写标题、链接标识、标签和正文。
5. 预览确认后关闭“草稿”并保存。CMS 会把修改提交到 GitHub。
6. GitHub Actions 检查媒体并构建站点；通过后自动发布到 GitHub Pages。

链接标识只使用英文字母、数字和短横线，例如 `weekly-30`。

正文编辑器支持可视化和 Markdown 源码两种模式。包含 `<OptimizedVideo>` 等 MDX 组件时，请使用源码模式编辑对应段落。

CMS 只允许直接上传 WebP 图片。PNG、JPEG、GIF 或视频应在本地使用媒体导入命令压缩：

```bash
pnpm media:import ./screenshot.png --article weekly-30 --section blog --year 2026 --purpose cover
```

## 在本地发布

```bash
pnpm article:new blog "文章标题"
pnpm dev
```

完成后提交并推送：

```bash
git add .
git commit -m "content: 发布文章标题"
git push
```

新文章默认包含 `draft: true`。发布前删除这一行或改为 `draft: false`，再推送到 `main`；部署工作流会自动发布站点。

## 首次启用 GitHub Pages

仓库管理员需要在 GitHub 打开 **Settings → Pages**，将 **Build and deployment → Source** 设置为 **GitHub Actions**。此操作只需执行一次。
