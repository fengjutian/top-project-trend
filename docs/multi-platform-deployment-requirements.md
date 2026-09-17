---
sidebar_position: 9
title: 多平台部署需求
---

# 多平台部署需求

## 背景

当前站点由 Docusaurus 构建，内容和 CMS 数据均存储在 GitHub 仓库中，并通过 GitHub Actions 发布到 GitHub Pages。

本需求用于在**不改变内容管理方式**的前提下，额外支持 Netlify 与 Vercel 的静态站点部署。三个平台应可同时订阅同一个 `main` 分支；任一平台的部署失败不得阻塞另外两个平台。

## 当前状态与约束

- 构建命令为 `pnpm build`，静态产物目录为 `build/`。
- GitHub Pages 的公开地址为 `https://fengjutian.github.io/top-project-trend/`，因此当前 Docusaurus 配置使用 `url: 'https://fengjutian.github.io'` 与 `baseUrl: '/top-project-trend/'`。
- Netlify 和 Vercel 的默认站点地址使用根路径 `/`，不能复用 GitHub Pages 的 `baseUrl`。
- CMS 通过 GitHub Contents API 直接向 `main` 分支提交 Markdown、MDX 和媒体文件；该方式必须保留。
- CMS 的媒体 URL 和 MDX 预览目前包含固定的 `/top-project-trend/` 前缀。仅切换 Docusaurus 的 `baseUrl` 不足以完整支持根路径部署。
- GitHub Pages 工作流仍是仓库内唯一的发布工作流；Netlify 和 Vercel 采用各自的 Git 集成构建与发布。

## 目标

1. 同一份提交可部署到 GitHub Pages、Netlify 和 Vercel。
2. 每个平台都输出正确的站内链接、静态资源、SEO canonical URL、RSS/Sitemap（如已启用）及 CMS 媒体地址。
3. 保留 GitHub Pages 的既有 URL，不产生链接迁移或内容丢失。
4. 保持 CMS 以 GitHub 为唯一内容源；不引入数据库、第三方内容存储或双向同步。
5. 为 Netlify 和 Vercel 提供可复制的导入与环境变量配置。

## 推荐方案

采用“**一次构建、按目标注入站点地址**”的方式。

| 部署目标 | `SITE_URL` | `BASE_URL` | 构建命令 | 产物目录 |
| --- | --- | --- | --- | --- |
| GitHub Pages | `https://fengjutian.github.io` | `/top-project-trend/` | `pnpm build` | `build` |
| Netlify | Netlify 分配的域名或绑定的自定义域名 | `/` | `pnpm build` | `build` |
| Vercel | Vercel 分配的域名或绑定的自定义域名 | `/` | `pnpm build` | `build` |

未来实现应让 `docusaurus.config.js` 读取受控环境变量，并在变量缺失时回退到当前 GitHub Pages 地址，确保现有 GitHub Actions 行为不变。

## 功能需求

### 1. 站点构建

- 系统应支持以环境变量指定完整站点域名和部署子路径。
- `SITE_URL` 必须是不带结尾 `/` 的绝对 HTTPS URL。
- `BASE_URL` 必须以 `/` 开头和结尾；根路径使用 `/`。
- 未设置变量时，构建结果必须与当前 GitHub Pages 完全兼容。
- 本地开发默认继续使用 GitHub Pages 的子路径；可通过显式环境变量模拟 Netlify 或 Vercel 根路径构建。

### 2. Netlify

- 仓库应提供 `netlify.toml`，声明 Base directory 为仓库根目录、Build command 为 `pnpm build`、Publish directory 为 `build`。
- Netlify 使用 Node.js 20 与 pnpm 9.15.9，以匹配现有 GitHub Actions。
- 生产环境必须设置 `SITE_URL` 为最终生产域名、`BASE_URL=/`。
- Deploy Preview 必须设置独立的 `SITE_URL`（可使用 Netlify 提供的部署 URL）和 `BASE_URL=/`，以避免预览页面生成指向生产站点的 canonical URL。
- 在 Netlify 控制台关闭 **Pretty URLs**，或在实现阶段确认其与 Docusaurus `trailingSlash` 配置的兼容性，避免重定向和大小写 URL 问题。

### 3. Vercel

- 仓库可选提供 `vercel.json`，用于显式声明构建命令和输出目录；若 Vercel 自动识别 Docusaurus 配置正确，可不强制该文件。
- Vercel 的 Root Directory 为仓库根目录，Build Command 为 `pnpm build`，Output Directory 为 `build`。
- Production、Preview 和 Development 环境均必须设置对应的 `SITE_URL`，并设置 `BASE_URL=/`。
- `main` 分支对应 Production Deployment，其他分支或 Pull Request 对应 Preview Deployment。

### 4. CMS 与媒体路径

- CMS 编辑、图片上传、媒体库插入和 MDX 预览不得依赖写死的 `/top-project-trend/` 路径。
- CMS 应使用与当前访问站点一致的 `baseUrl` 生成媒体公开路径；GitHub Pages 生成 `/top-project-trend/media/...`，Netlify/Vercel 生成 `/media/...`。
- 已发布文章中保留的旧媒体路径必须继续在 GitHub Pages 正常显示。
- 对 Netlify/Vercel，应在实现阶段选择并记录以下一种兼容策略：
  - 为 `/top-project-trend/media/*` 增加到 `/media/*` 的重定向；或
  - 在构建阶段转换旧文章中的 GitHub Pages 媒体路径；或
  - 将媒体 URL 统一改为相对路径，并执行一次经过审查的内容迁移。
- 不得在浏览器端暴露 GitHub PAT；CMS 现有 `sessionStorage` 行为保持不变。

### 5. 域名与 SEO

- 三个平台允许使用各自的默认域名进行访问和预览。
- 生产主域名必须唯一。例如，选择 Netlify 或 Vercel 自定义域名为主域名后，GitHub Pages 应保留为备用地址，或配置 301 重定向至主域名。
- `SITE_URL` 必须指向每个环境实际访问的域名，避免 canonical、Open Graph 和 sitemap 指向错误站点。
- 如使用自定义域名，DNS、HTTPS 证书和平台域名绑定由仓库管理员在对应控制台完成。

## 非功能需求

- 不升级 Docusaurus、React 或 Node 依赖，除非在独立变更中评估并批准；本需求仅涵盖多平台部署。
- 不修改现有内容目录、文章 Front Matter 格式、GitHub Actions 定时发布或外链审计流程。
- 平台配置不包含 Token、密码或其他秘密；仅通过各平台的环境变量/Secrets 管理敏感值。
- 构建失败日志必须能明确区分依赖安装、媒体审计与 Docusaurus 构建阶段。

## 验收标准

1. 在未设置新环境变量时，`pnpm build` 成功，GitHub Pages 地址和媒体资源保持可用。
2. 设置 `SITE_URL=https://example.netlify.app`、`BASE_URL=/` 后，`pnpm build` 成功，生成文件中的站内资源链接不包含 `/top-project-trend/`。
3. 设置 Vercel 的生产和预览变量后，生产部署及任一 Preview Deployment 均成功访问首页、`/admin`、`/blog` 和至少一篇含图片文章。
4. CMS 分别从 GitHub Pages、Netlify 和 Vercel 地址访问时，均能加载文章、上传图片、插入媒体并保存到 `main` 分支。
5. 一次 CMS 保存或 Git 推送后，GitHub Pages、Netlify 和 Vercel 都收到独立部署；其中一方失败不影响其他两方。
6. 旧文章在 GitHub Pages、Netlify 和 Vercel 上均不出现媒体 404。

## 实施范围

预计涉及以下文件，实际变更以前须再次评审：

- `docusaurus.config.js`：按环境生成 `url` 与 `baseUrl`。
- `src/pages/admin/index.js`、`src/admin/lib/github.ts` 及相关组件：移除 CMS 媒体路径中的硬编码部署前缀。
- `netlify.toml`：新增 Netlify 构建配置。
- `vercel.json`：如自动识别不足时新增 Vercel 构建配置。
- `README.md`、`docs/publishing.md`：补充平台导入、环境变量和主域名策略。

## 不在本期范围内

- 将 CMS 替换为 Netlify CMS、Decap CMS、Sanity 或其他 SaaS CMS。
- 多人权限、内容审批流和数据库持久化。
- 自动设置 DNS、创建 Netlify/Vercel 项目或写入任一平台的账户配置。
- Docusaurus 2 升级到 Docusaurus 3。
