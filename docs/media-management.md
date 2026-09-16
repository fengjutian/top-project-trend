---
sidebar_position: 7
title: 媒体资源管理
---

# 媒体资源管理

新资源统一通过导入命令处理，不要直接把 PNG、GIF 或视频复制进文章目录。

## 导入图片

```bash
pnpm media:import ./screenshot.png --article zhoukan-30 --section blog --year 2026 --purpose cover
```

命令会限制图片宽度、转换为 WebP、添加内容哈希并输出可粘贴的 Markdown。

GIF 和视频会被转换为 H.264 MP4：

```bash
pnpm media:import ./demo.gif --article zhoukan-30 --section blog --year 2026 --purpose demo
```

资源统一存放在：

```text
static/media/<栏目>/<年份>/<文章>/
```

## 检查资源

```bash
pnpm media:audit
pnpm media:audit -- --write-manifest
pnpm media:audit:strict
```

严格模式会拒绝超过以下限制的资源：

- 图片、GIF：200KB
- MP4：3MB
- 图片宽度：2560px

审计中的“未引用”采用文件名匹配，仅作为清理提示；删除前必须人工确认。

## 命名和提交规则

- 文件名使用小写英文和短横线。
- 公共资源放在 `static/media/shared/`。
- 同一图片只保留一份，不按栏目重复复制。
- 不提交原始 PSD、设计稿或未压缩视频。
- 删除文章时同步执行媒体审计。
