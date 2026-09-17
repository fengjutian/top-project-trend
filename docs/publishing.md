---
sidebar_position: 8
title: 文章发布
---

# 文章发布

本站支持两种写作方式，文章最终都保存在 GitHub 仓库的 `content/` 目录中。

## 使用内置管理后台

访问站点的 `/admin` 路径，例如本地开发环境：

```text
http://localhost:3000/top-project-trend/admin
```

首次进入时，需要提供一个 GitHub Fine-grained personal access token：

- Repository access 只选择 `fengjutian/top-project-trend`。
- Repository permissions 中仅开启 **Contents: Read and write**。
- Token 只保存在当前浏览器的 `sessionStorage`，关闭标签页后清除，不会写入源码或提交到仓库。

后台支持：

- 按栏目和发布日期倒序浏览，并按全部、草稿、已发布筛选。
- 搜索、新建、编辑、复制和删除文章。
- 自动生成链接标识、摘要和技术标签。
- Markdown 预览及未保存内容离开提醒。
- 编辑内容自动暂存到当前浏览器；刷新或意外关闭后可以恢复。
- 保存前检查 GitHub 文件版本，检测到其他位置的更新时停止覆盖。
- 查看最近 20 个 Git 提交版本，并把任一历史版本载入编辑器后重新保存。
- 在媒体库中浏览和复用栏目图片；检测到文章引用时禁止删除。
- 上传 PNG、JPEG 或 WebP；浏览器会自动缩放、转换为 WebP 并压缩到 200KB 以内。
- 栏目仪表盘统计文章、草稿、已发布、错误项、缺少摘要和缺少封面的数量。
- 发布前检查标题、摘要、封面、标签、重复链接标识、空链接、图片替代文字和标题层级。
- 标签管理支持在当前栏目内跨文章合并或重命名标签。
- 文章列表支持多选，并批量转为草稿或批量发布。
- 可设置定时发布时间和自动下线时间；GitHub Actions 每 15 分钟处理一次。
- 后台显示最近一次 GitHub Actions 部署状态，并可跳转查看运行日志。
- 正式发布前会阻止包含错误级检查项的文章提交。
- 新文章可直接套用技术周刊、开源项目介绍或技术教程模板。
- 编辑区实时显示字数、预计阅读时间、章节数量和正文大纲。
- 专注模式会隐藏文章侧栏，仅保留当前编辑内容。
- 预览使用浏览器 MDX 编译器和站点真实 `MDXComponents`，支持主题样式、代码块、图片及 `OptimizedVideo`。
- 预览会把文章相对媒体路径解析到 GitHub Raw，把集中媒体路径解析到站点 `baseUrl`，无需先发布文章。
- 全站仪表盘会汇总 13 个栏目的文章、草稿、发布状态和内容健康度。
- 发布日历按月展示发布日期、定时发布和自动下线事件。
- `External link audit` 工作流每周检查一次全部外链，也可在仪表盘手动触发。
- 每次部署都会生成媒体审计清单，仪表盘展示未引用、重复、超预算媒体和总体积。
- 清理面板只允许删除审计为未引用的文件，且仍会要求人工二次确认。

常用快捷键：

- `Ctrl/Cmd + S`：保存当前文章。
- `Ctrl/Cmd + K`：聚焦文章搜索。
- `Ctrl/Cmd + Shift + P`：切换编辑和预览。

定时发布使用 UTC 时间保存，后台输入框会自动按浏览器本地时区显示。到达 `publish_at` 后文章自动设为已发布；到达 `unpublish_at` 后自动转为草稿。也可以手动运行 `Scheduled publishing` GitHub Actions 工作流立即处理。
- 草稿控制，以及退出时清除当前会话中的 GitHub Token。

保存文章后会直接提交到 `main`，并触发 GitHub Actions 自动部署。删除操作也会形成 Git 提交，因此仍可通过 Git 历史恢复。

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
