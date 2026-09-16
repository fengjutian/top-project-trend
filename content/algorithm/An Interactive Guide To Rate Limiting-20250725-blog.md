---
date: 2025-07-25
slug: zhoukan1
title: An Interactive Guide To Rate Limiting
authors: fengjutian
tags: [An Interactive Guide To Rate Limiting]
---
##  An Interactive Guide To Rate Limiting
---

## 🚦 Rate Limiting 简介

- **目的**：限制用户请求频率，防止资源被滥用，提升服务稳定性与质量。
- **优势**：
  - 防止资源枯竭
  - 降低服务器成本
  - 提供 DDoS 防护的基础手段

---

## 🧪 四种常见 Rate Limiting 算法（均附有交互式演示）

### 🎟️ Token Bucket
- 固定容量的令牌桶
- 定期填充令牌，处理请求需消费一个令牌
- 若无令牌，则拒绝请求或延迟处理
- 支持短时间突发流量

### 💧 Leaky Bucket
- 请求进入桶中，桶以恒定速率漏出（处理请求）
- 桶满则新请求被丢弃
- 平滑处理流量，输出速率稳定

### 🕒 Fixed Window Counter
- 时间被划分为固定窗口（如每分钟）
- 每个窗口统计请求数量，超出则拒绝
- 简单高效，但可能在窗口交界处引发请求突刺

### 🪟 Sliding Window Counter
- 记录每个请求的时间戳
- 每次新请求到来时，检查过去 X 秒内的请求数量
- 超限则拒绝，否则记录请求
- 更平滑但实现稍复杂


地址：https://blog.sagyamthapa.com.np/interactive-guide-to-rate-limiting


